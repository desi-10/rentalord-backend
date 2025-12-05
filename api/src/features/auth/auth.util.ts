import { Response } from "express";
import { addMinutes, differenceInMinutes } from "date-fns";
import prisma from "../../utils/db.js";
import { LoginAttempt } from "@prisma/client";

// import { prisma } from "../../../utils/db.js";
// import { addMinutes } from "date-fns";

// const MAX_ATTEMPTS = 5;
// const LOCK_DURATION_MINUTES = 1;

// export async function recordFailedAttempt(phone_number: string) {
//   const now = new Date();

//   const existing = await prisma.loginAttempt.findUnique({
//     where: { phone_number },
//   });

//   if (!existing) {
//     await prisma.loginAttempt.create({
//       data: { phone_number, attempts: 1, lastAttempt: now },
//     });
//     return;
//   }

//   let updateData: any = { attempts: existing.attempts + 1, lastAttempt: now };

//   if (existing.attempts + 1 >= MAX_ATTEMPTS) {
//     updateData.lockedUntil = addMinutes(now, LOCK_DURATION_MINUTES);
//   }

//   await prisma.loginAttempt.update({
//     where: { phone_number },
//     data: updateData,
//   });
// }

// export async function resetLoginAttempts(phone_number: string) {
//   await prisma.loginAttempt.deleteMany({ where: { phone_number } });
// }

const MAX_ATTEMPTS = 5; // Max allowed before initial lock
const EXTRA_ATTEMPTS_BEFORE_ESCALATE = 3; // More failed attempts after unlock → escalate lock time
const BASE_LOCK_MINUTES = 1; // Initial lock
const DECAY_AFTER_MINUTES = 30; // Decay if user stays calm

export async function recordFailedAttempt(phone_number: string) {
  const now = new Date();

  let existing = await prisma.loginAttempt.findUnique({
    where: { phone_number },
  });

  // 🟢 No record yet — create one
  if (!existing) {
    await prisma.loginAttempt.create({
      data: {
        phone_number,
        attempts: 1,
        last_attempt: now,
        lock_count: 0,
        locked_until: null,
      },
    });
    return;
  }

  let { attempts, lock_count, locked_until, last_attempt } = existing;

  // 🔹 Step 1: Check if user’s cooldown time has passed (decay logic)
  if (last_attempt) {
    const minsSinceLast = differenceInMinutes(now, last_attempt);
    if (minsSinceLast > DECAY_AFTER_MINUTES && lock_count > 0) {
      lock_count = Math.max(0, lock_count - 1);
    }
  }

  // 🔹 Step 2: If still locked, ignore or re-lock longer if abuse continues
  if (locked_until && locked_until > now) {
    const remaining = Math.ceil(
      (locked_until.getTime() - now.getTime()) / 60000
    );

    throw new Error(`Account is locked. Try again in ${remaining} minute(s).`);
  }

  // 🔹 Step 3: Add a new failed attempt
  let newAttempts = attempts + 1;
  let updateData: Partial<LoginAttempt> = {
    attempts: newAttempts,
    last_attempt: now,
    lock_count,
  };

  // 🔹 Step 4: Handle first lock
  if (newAttempts >= MAX_ATTEMPTS && lock_count === 0) {
    updateData.lock_count = 1;
    updateData.locked_until = addMinutes(now, BASE_LOCK_MINUTES);
    updateData.attempts = 0;
  }

  // 🔹 Step 5: If user was previously locked and keeps failing, escalate
  else if (lock_count > 0 && newAttempts >= EXTRA_ATTEMPTS_BEFORE_ESCALATE) {
    const newLockCount = lock_count + 1;
    const newLockTime = BASE_LOCK_MINUTES * Math.pow(2, newLockCount - 1);

    updateData.lock_count = newLockCount;
    updateData.locked_until = addMinutes(now, newLockTime);
    updateData.attempts = 0;
  }

  // 🔹 Step 6: Save updated record
  await prisma.loginAttempt.update({
    where: { phone_number },
    data: updateData,
  });
}

export async function resetLoginAttempts(phone_number: string) {
  await prisma.loginAttempt.updateMany({
    where: { phone_number },
    data: { attempts: 0, locked_until: null, lock_count: 0 },
  });
}

export async function isAccountLocked(phone_number: string) {
  const record = await prisma.loginAttempt.findUnique({
    where: { phone_number },
  });
  if (!record) return false;

  if (record.locked_until && record.locked_until > new Date()) {
    return true;
  }

  return false;
}

export const incrementOtpAttempts = async (phone_number: string) => {
  await prisma.oTP.upsert({
    where: { phone_number },
    update: { attempts: { increment: 1 } },
    create: {
      phone_number,
      code: "000000", // placeholder
      purpose: "login",
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 1,
    },
  });
};

export const getOtpAttempts = async (phone_number: string) => {
  const otp = await prisma.oTP.findUnique({
    where: { phone_number },
    select: { attempts: true },
  });
  return otp?.attempts || 0;
};

export const resetOtpAttempts = async (phone_number: string) => {
  await prisma.oTP.updateMany({
    where: { phone_number },
    data: { attempts: 0 },
  });
};

export const generateOtpForLogin = async (phone_number: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.oTP.upsert({
    where: { phone_number },
    update: {
      code,
      purpose: "login",
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
      attempts: 0,
    },
    create: {
      phone_number,
      code,
      purpose: "login",
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Send via SMS/Email (implement in your notifier service)
  // await sendOtpMessage(phone_number, code);

  return code;
};

export const setRefreshToken = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};
