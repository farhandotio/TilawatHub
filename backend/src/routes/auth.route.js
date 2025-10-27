// routes/auth.routes.js
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validationRules from "../middlewares/validation.middleware.js";

const router = express.Router();

// Local auth
router.post(
  "/register",
  validationRules.registerValidationRules,
  authController.register
);

router.post(
  "/login",
  validationRules.loginValidationRules,
  authController.login
);

// Logout
router.post("/logout", authController.logout);

// Google OAuth: initiate (redirects to Google)
router.get("/google", authController.googleAuth);

// Google OAuth callback: handled inside controller (which uses passport)
router.get("/google/callback", authController.googleOAuthCallback);

// Protected route example: get current user
router.get("/me", authController.authenticateJWT, authController.me);

export default router;
