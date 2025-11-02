import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export const generateOTPController = async (req: Request, res: Response) => {
  const result = await authService.generateOtpService(req.body);
  return res.json(result);
};

export const verifyOTPController = async (req: Request, res: Response) => {
  const result = await authService.verifyRegistrationOtpService(req.body);
  return res.json(result);
};

export const registerController = async (req: Request, res: Response) => {
  const result = await authService.registerService(req.body);
  return res.json(result);
};

export const loginController = async (req: Request, res: Response) => {
  const result = await authService.loginService(req.body);
  return res.json(result);
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await authService.resetPasswordService(userId, req.body);
  res.json(result);
};

export const updatePasswordController = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await authService.updatePasswordService(userId, req.body);
  res.json(result);
};
