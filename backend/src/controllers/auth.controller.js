// controllers/auth.controller.js
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { publishToQueue } from "../broker/rabbit.js";
import config from "../config/config.js";

// --------- Helper: use config (no process.env references here) ----------
const JWT_SECRET = config.JWT_SECRET || "change_this_secret";
const CLIENT_URL = config.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = config.NODE_ENV || "development";

// Cookie options generator
function cookieOptions() {
  return {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

// --------- Passport Google Strategy Setup (uses config) ----------
const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = config.GOOGLE_CALLBACK_URL;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      // verify callback
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = null;

          if (email) {
            user = await userModel.findOne({
              $or: [{ googleId: profile.id }, { email }],
            });
          } else {
            user = await userModel.findOne({ googleId: profile.id });
          }

          if (user) return done(null, user);

          // create user
          const newUser = await userModel.create({
            googleId: profile.id,
            email,
            fullname: {
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
            },
          });

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

// --------- Utility: sign token ----------
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// --------- Controller functions ----------
export async function register(req, res) {
  try {
    const { email, password, fullname } = req.body;
    if (!email || !password || !fullname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const isUserExist = await userModel.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email,
      password: hash,
      fullname,
    });

    const token = signToken({ id: user._id, role: user.role });
    res.cookie("token", token, cookieOptions());

    try {
      await publishToQueue("user.created", {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      });
    } catch (e) {
      console.error("publishToQueue error:", e?.message || e);
    }

    return res.status(201).json({
      message: "User created successfully!",
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user._id, role: user.role });
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Initiates Google OAuth (route handler), uses passport
export function googleAuth(req, res, next) {
  return passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
}

// Callback route handler after Google OAuth
export async function googleOAuthCallback(req, res, next) {
  return passport.authenticate(
    "google",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          console.error("google callback err:", err);
          return res.redirect(`${CLIENT_URL}/?oauth=error`);
        }

        if (!user) {
          return res.redirect(`${CLIENT_URL}/?oauth=fail`);
        }

        const token = signToken({ id: user._id, role: user.role });
        res.cookie("token", token, cookieOptions());

        try {
          await publishToQueue("user.created", {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
          });
        } catch (e) {
          console.error("publishToQueue error:", e?.message || e);
        }

        return res.redirect(CLIENT_URL);
      } catch (e) {
        console.error("googleOAuthCallback error:", e);
        return res.redirect(`${CLIENT_URL}/?oauth=error`);
      }
    }
  )(req, res, next);
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  });
  if (req.logout) {
    req.logout();
  }
  return res.status(200).json({ message: "Logged out" });
}

export async function me(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await userModel.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export function authenticateJWT(req, res, next) {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers?.authorization;
    const token = tokenFromCookie || (authHeader && authHeader.split(" ")[1]);

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    console.error("authenticateJWT error:", err?.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
