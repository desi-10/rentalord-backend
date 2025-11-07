import express from "express";
import * as authController from "./auth.controller.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  generateOtpSchema,
  registerSchema,
  resetPasswordSchema,
  twofaSchema,
} from "./auth.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { createRateLimiter } from "../../utils/rate-limit.js";

const router = express.Router();

router.post(
  "/generate-otp",
  createRateLimiter(3, "10 m"), // max 3 per 10 minutes
  validateSchema(generateOtpSchema),
  authController.generateOTPController
);

router.post(
  "/refresh",
  createRateLimiter(12, "2 m"), // 12 per 2 mins (~1 per 10s)
  authController.refreshTokenController
);

router.post(
  "/twoFa",
  authenticate,
  createRateLimiter(5, "5 m"), // 5 per 5 minutes
  validateSchema(twofaSchema),
  authController.twoFaController
);

router.post(
  "/register",
  createRateLimiter(5, "1 m"), // 5 per minute
  validateSchema(registerSchema),
  authController.registerController
);

router.post(
  "/login",
  createRateLimiter(5, "1 m"), // 5 per minute
  authController.loginController
);

router.post(
  "/update-password",
  authenticate,
  createRateLimiter(5, "10 m"), // 5 per 10 minutes
  validateSchema(resetPasswordSchema),
  authController.resetPasswordController
);

router.post(
  "/forgot-password",
  createRateLimiter(3, "10 m"), // 3 per 10 minutes
  validateSchema(resetPasswordSchema),
  authController.resetPasswordController
);

export default router;
