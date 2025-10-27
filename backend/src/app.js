// app.js
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./config/config.js";
import cors from "cors";

const app = express();

// Use CLIENT_URL from config (fallback to localhost)
const CLIENT_URL = config.CLIENT_URL || "http://localhost:5173";

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize passport BEFORE routes that use it
app.use(passport.initialize());
// If you plan to use sessions in future:
// app.use(passport.session());

// Setup Google Strategy (use config values)
const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID || config.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET || config.CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = config.GOOGLE_CALLBACK_URL;

// Only configure strategy if credentials exist
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        // IMPORTANT: this should be the full callback URL you registered in Google Cloud Console
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        // Minimal verify: pass profile to route/controller which will find/create a user
        return done(null, profile);
      }
    )
  );

  // serialize/deserialize (safe minimal implementation)
  passport.serializeUser((user, done) => {
    // only used if you enable sessions; safe to keep
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
} else {
  console.warn(
    "Google OAuth not configured — missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL in config."
  );
}

// Mount auth routes (these routes call passport internally)
app.use("/api/auth", authRoutes);

export default app;
