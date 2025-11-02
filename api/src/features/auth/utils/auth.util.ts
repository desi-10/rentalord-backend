import { addMinutes, differenceInMinutes } from "date-fns";
import { prisma } from "../../../utils/db.js";

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
        lastAttempt: now,
        lockCount: 0,
        lockedUntil: null,
      },
    });
    return;
  }

  let { attempts, lockCount, lockedUntil, lastAttempt } = existing;

  // 🔹 Step 1: Check if user’s cooldown time has passed (decay logic)
  if (lastAttempt) {
    const minsSinceLast = differenceInMinutes(now, lastAttempt);
    if (minsSinceLast > DECAY_AFTER_MINUTES && lockCount > 0) {
      lockCount = Math.max(0, lockCount - 1);
    }
  }

  // 🔹 Step 2: If still locked, ignore or re-lock longer if abuse continues
  if (lockedUntil && lockedUntil > now) {
    const remaining = Math.ceil(
      (lockedUntil.getTime() - now.getTime()) / 60000
    );

    throw new Error(`Account is locked. Try again in ${remaining} minute(s).`);
  }

  // 🔹 Step 3: Add a new failed attempt
  let newAttempts = attempts + 1;
  let updateData: any = { attempts: newAttempts, lastAttempt: now, lockCount };

  // 🔹 Step 4: Handle first lock
  if (newAttempts >= MAX_ATTEMPTS && lockCount === 0) {
    updateData.lockCount = 1;
    updateData.lockedUntil = addMinutes(now, BASE_LOCK_MINUTES);
    updateData.attempts = 0;
  }

  // 🔹 Step 5: If user was previously locked and keeps failing, escalate
  else if (lockCount > 0 && newAttempts >= EXTRA_ATTEMPTS_BEFORE_ESCALATE) {
    const newLockCount = lockCount + 1;
    const newLockTime = BASE_LOCK_MINUTES * Math.pow(2, newLockCount - 1);

    updateData.lockCount = newLockCount;
    updateData.lockedUntil = addMinutes(now, newLockTime);
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
    data: { attempts: 0, lockedUntil: null, lockCount: 0 },
  });
}

export async function isAccountLocked(phone_number: string) {
  const record = await prisma.loginAttempt.findUnique({
    where: { phone_number },
  });
  if (!record) return false;

  if (record.lockedUntil && record.lockedUntil > new Date()) {
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
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
      attempts: 0,
    },
    create: {
      phone_number,
      code,
      purpose: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Send via SMS/Email (implement in your notifier service)
  // await sendOtpMessage(phone_number, code);

  return code;
};
