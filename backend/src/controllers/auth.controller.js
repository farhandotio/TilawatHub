import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {
  const {
    email,
    password,
    fullname: { firstName, lastName },
  } = req.body;

  const isUserExist = await userModel.findOne({ email });

  if (isUserExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    email,
    password: hash,
    fullname: { firstName, lastName },
  });

  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token);

  await publishToQueue("user.created", {
    id: user._id,
    email: user.email,
    fullname: user.fullname,
    role: user.role,
  });

  res.status(201).json({
    message: "User created succesfully!",
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    },
  });
}

export async function googleOAuthCallback(req, res) {
  const user = req.user;

  const isUserExist = await userModel.findOne({
    $or: [{ googleId: user.id }, { email: user.emails[0].value }],
  });

  if (isUserExist) {
    // User exists, generate JWT token
    const token = jwt.sign(
      { id: isUserExist._id, role: isUserExist.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token);

    return res.redirect("http://localhost:5173/");
  }

  const newUser = await userModel.create({
    googleId: user.id,
    email: user.emails[0].value,
    fullname: {
      firstName: user.name.givenName,
      lastName: user.name.familyName,
    },
  });

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token);

  await publishToQueue("user.created", {
    id: newUser._id,
    email: newUser.email,
    fullname: newUser.fullname,
    role: newUser.role,
  });

  res.redirect("http://localhost:5173/");
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid " });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token);

  res.status(200).json({
    message: "Login successful!",
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    },
  });
}
