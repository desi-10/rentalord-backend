import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../../utils/api-error.js";
import { apiResponse } from "../../../utils/api-response.js";
import { prisma } from "../../../utils/db.js";
import { generateCode } from "../../../utils/generate-code.js";
import { generateToken } from "../../../utils/jwt.js";
import { hashed, compareHashed } from "../../../utils/hash.js";
import {
  TypeRegister,
  TypeVerifyOtp,
  TypeLogin,
  TypeGenerateOTP,
  TypeResetPassword,
  TypeUpdatePassword,
} from "../validators/auth.validator.js";
import {
  generateOtpForLogin,
  getOtpAttempts,
  incrementOtpAttempts,
  isAccountLocked,
  recordFailedAttempt,
  resetLoginAttempts,
  resetOtpAttempts,
} from "../utils/auth.util.js";
import {
  getUserByIdUtil,
  getUserByPhoneNumber,
} from "../../users/utils/users.utils.js";

export const generateOtpService = async (data: TypeGenerateOTP) => {
  const { phone_number, purpose } = data;

  const existingUser = await getUserByPhoneNumber(phone_number);

  // Rules depending on purpose
  if (purpose === "register" && existingUser)
    throw new ApiError("User already exists", StatusCodes.CONFLICT);
  if (purpose === "login" && !existingUser)
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const otp = generateCode(4);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.oTP.upsert({
    where: { phone_number },
    update: { code: otp, expiresAt, purpose },
    create: {
      phone_number,
      code: otp,
      purpose,
      expiresAt,
      userId: existingUser?.id || null,
    },
  });

  // await sendSms(phone_number, `Your Rentalord verification code is ${otp}`);

  return apiResponse("OTP sent successfully", { phone_number, otp });
};

export const registerService = async (data: TypeRegister) => {
  const { phone_number, password, first_name, last_name, otp } = data;

  // OTP must exist and be valid
  const otpRecord = await prisma.oTP.findUnique({ where: { phone_number } });
  if (!otpRecord) throw new ApiError("OTP not found", StatusCodes.NOT_FOUND);
  if (otpRecord.purpose !== "register")
    throw new ApiError("Invalid OTP purpose", StatusCodes.BAD_REQUEST);
  if (otpRecord.code !== otp)
    throw new ApiError("Invalid OTP code", StatusCodes.UNAUTHORIZED);
  if (otpRecord.expiresAt < new Date())
    throw new ApiError("OTP expired", StatusCodes.BAD_REQUEST);

  // Ensure user does not already exist
  const existingUser = await getUserByPhoneNumber(phone_number);
  if (existingUser)
    throw new ApiError("User already exists", StatusCodes.CONFLICT);

  const hash = await hashed(password, 10);

  const user = await prisma.user.create({
    data: {
      phone_number,
      password: hash,
      first_name,
      last_name,
      is_verified: true, // verified automatically since OTP matched
    },
  });

  // Remove OTP after successful registration
  await prisma.oTP.delete({ where: { phone_number } });

  const token = generateToken(user.id);
  const { password: _, ...userData } = user;

  return apiResponse("Registration successful", {
    user: userData,
    token,
  });
};

export const verifyRegistrationOtpService = async (data: TypeVerifyOtp) => {
  const { phone_number, otp } = data;

  const record = await prisma.oTP.findUnique({
    where: { phone_number },
    include: { user: true },
  });

  if (!record) throw new ApiError("OTP not found", StatusCodes.NOT_FOUND);
  if (record.code !== otp)
    throw new ApiError("Invalid OTP", StatusCodes.UNAUTHORIZED);
  if (record.expiresAt < new Date())
    throw new ApiError("OTP expired", StatusCodes.BAD_REQUEST);
  if (!record.user)
    throw new ApiError("No user linked to this OTP", StatusCodes.BAD_REQUEST);

  await prisma.user.update({
    where: { id: record.user.id },
    data: { is_verified: true },
  });

  await prisma.oTP.delete({ where: { phone_number } });

  const token = generateToken(record.user.id);
  const { password, ...userData } = record.user;

  return apiResponse("Phone number verified successfully", {
    user: userData,
    token,
  });
};

export const loginService = async (data: TypeLogin) => {
  const { phone_number, password, otp } = data;

  const user = await prisma.user.findUnique({
    where: { phone_number },
    include: {
      memberships: {
        select: {
          property: { select: { id: true, name: true } },
          role: true,
        },
      },
    },
  });

  // 1️⃣ Check if account is locked
  if (await isAccountLocked(phone_number)) {
    throw new ApiError(
      "Too many failed attempts. Account temporarily locked. Try again later.",
      StatusCodes.FORBIDDEN
    );
  }

  // 2️⃣ Validate user existence
  if (!user)
    throw new ApiError("Invalid phone number", StatusCodes.UNAUTHORIZED);
  if (!user.is_verified)
    throw new ApiError("User not verified", StatusCodes.FORBIDDEN);

  // 3️⃣ Password check
  const passwordValid = password
    ? await compareHashed(password, user.password)
    : false;

  if (!passwordValid && !otp) {
    await recordFailedAttempt(phone_number);
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  // 4️⃣ Handle 2FA
  if (user.isTwoFactorEnabled) {
    // If password is valid but OTP not provided yet → prompt OTP
    if (passwordValid && !otp) {
      // Generate and send OTP (SMS or email, depending on your setup)
      const generatedOtp = await generateOtpForLogin(user.phone_number);
      await resetOtpAttempts(phone_number);
      return apiResponse("OTP sent. Please verify to complete login.", {
        requires2FA: true,
        otp_sent: true,
        generatedOtp,
      });
    }

    // If OTP provided → verify it
    if (otp) {
      const otpRecord = await prisma.oTP.findUnique({
        where: { phone_number },
      });

      if (
        otpRecord &&
        otpRecord.code === otp &&
        otpRecord.purpose === "login" &&
        otpRecord.expiresAt > new Date()
      ) {
        await prisma.oTP.delete({ where: { phone_number } });
        await resetOtpAttempts(phone_number);
      } else {
        await incrementOtpAttempts(phone_number);
        const attempts = await getOtpAttempts(phone_number);
        await recordFailedAttempt(phone_number);

        if (attempts >= 3) {
          await prisma.oTP.delete({ where: { phone_number } });
          await resetOtpAttempts(phone_number);
          throw new ApiError(
            "Too many invalid OTP attempts. Please request a new OTP.",
            StatusCodes.FORBIDDEN
          );
        }

        throw new ApiError("Invalid or expired OTP", StatusCodes.UNAUTHORIZED);
      }
    } else if (!otp) {
      // If OTP required but not provided
      await recordFailedAttempt(phone_number);
      throw new ApiError("OTP required for login.", StatusCodes.FORBIDDEN);
    }
  }

  // 5️⃣ Reset failed attempts after success
  await resetLoginAttempts(phone_number);
  await resetOtpAttempts(phone_number);

  // 6️⃣ Generate JWT
  const token = generateToken(user.id);
  const { password: _, ...userData } = user;

  return apiResponse("Login successful", { user: userData, token });
};

export const resendOtpService = async (phone_number: string) => {
  const otp = generateCode(4);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.oTP.upsert({
    where: { phone_number },
    update: { code: otp, expiresAt },
    create: { phone_number, code: otp, purpose: "register", expiresAt },
  });

  // await sendSms(phone_number, `Your new OTP code is ${otp}`);

  return apiResponse("New OTP sent successfully", { phone_number });
};

export const resetPasswordService = async (
  userId: string,
  data: TypeResetPassword
) => {
  const user = await getUserByIdUtil(userId);
  if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const ok = await compareHashed(data.password, user.password);
  if (!ok)
    throw new ApiError("Invalid credentials", StatusCodes.UNPROCESSABLE_ENTITY);

  // Generate OTP (4-digit code)
  const code = generateCode(4);

  // Store OTP (create or update)
  await prisma.oTP.upsert({
    where: { phone_number: user.phone_number },
    update: {
      code,
      purpose: "reset_password",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    },
    create: {
      phone_number: user.phone_number,
      code,
      purpose: "reset_password",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Optional: Send OTP (SMS, email, etc.)
  // await sendOtp(user.phone_number, code);

  return apiResponse("OTP sent for password reset", code);
};

export const updatePasswordService = async (
  userId: string,
  data: TypeUpdatePassword
) => {
  const { new_password, confirm_password, otp } = data;

  if (new_password !== confirm_password)
    throw new ApiError("Passwords do not match", StatusCodes.BAD_REQUEST);

  const user = await getUserByIdUtil(userId);
  if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

  const otpRecord = await prisma.oTP.findUnique({
    where: { phone_number: user.phone_number },
  });

  if (
    !otpRecord ||
    otpRecord.purpose !== "reset_password" ||
    otpRecord.expiresAt < new Date() ||
    otpRecord.code !== otp
  ) {
    throw new ApiError("Invalid or expired OTP", StatusCodes.UNAUTHORIZED);
  }

  const hash = await hashed(new_password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { phone_number: user.phone_number },
      data: { password: hash },
    }),
    prisma.oTP.delete({ where: { phone_number: user.phone_number } }),
  ]);

  return apiResponse("Password updated successfully");
};
