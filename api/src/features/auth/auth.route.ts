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

const router = express.Router();

router.post(
  "/generate-otp",
  validateSchema(generateOtpSchema),
  authController.generateOTPController
);

// router.post("/verify", authController.verifyOTPController);
router.post("/refresh", authController.refreshTokenController);

router.post(
  "/twoFa",
  authenticate,
  validateSchema(twofaSchema),
  authController.twoFaController
);

router.post(
  "/register",
  validateSchema(registerSchema),
  authController.registerController
);
router.post("/login", authController.loginController);

router.post(
  "/update-password",
  authenticate,
  validateSchema(resetPasswordSchema),
  authController.resetPasswordController
);

router.post(
  "/forgot-password",
  authenticate,
  validateSchema(resetPasswordSchema),
  authController.resetPasswordController
);

export default router;
