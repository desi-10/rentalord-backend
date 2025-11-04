import { z } from "zod";

export const generateOtpSchema = z.object({
  phone_number: z.string(),
  purpose: z.enum(["login", "register", "2fa"]),
});

export const registerSchema = z.object({
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string(),
  last_name: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
  phone_number: z.string(),
  password: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

export const verifyOtpSchema = z.object({
  phone_number: z.string(),
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updatePasswordSchema = z
  .object({
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const twofaSchema = z.object({
  phone_number: z.string(),
  otp: z.string().length(6, "OTP is 6 digits"),
  action: z.enum(["on", "off"]).default("on"),
});

export type TypeRegister = z.infer<typeof registerSchema>;
export type TypeLogin = z.infer<typeof loginSchema>;
export type TypeVerifyOtp = z.infer<typeof verifyOtpSchema>;
export type TypeGenerateOTP = z.infer<typeof generateOtpSchema>;
export type TypeResetPassword = z.infer<typeof resetPasswordSchema>;
export type TypeUpdatePassword = z.infer<typeof updatePasswordSchema>;
export type TypeOTP = z.infer<typeof twofaSchema>;
