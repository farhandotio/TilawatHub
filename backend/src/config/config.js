// config/config.js
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const NODE_ENV = process.env.NODE_ENV || "development";

const _config = {
  NODE_ENV,
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  
  // Email credentials (for Nodemailer)
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS, // <-- App Password বা SMTP Password
  REFRESH_TOKEN: process.env.REFRESH_TOKEN, // Optional, যদি OAuth2 ব্যবহার করেন

  // Client-facing URL (frontend)
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Google OAuth2
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET,
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`,
};

export default _config;
