import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";
import { TypeCreateSubscription } from "./subscription.validator.js";

export const createSubscriptionService = async (
  userId: string,
  data: TypeCreateSubscription
) => {
  const { plan_id, payment_reference } = data;

  // Fetch the selected plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: plan_id },
  });

  if (!plan) throw new ApiError("Invalid plan selected", StatusCodes.NOT_FOUND);

  // Check if user already has an active subscription
  const activeSub = await prisma.subscription.findFirst({
    where: {
      user_id: userId,
      status: "active",
    },
  });

  if (activeSub)
    throw new ApiError(
      "You already have an active subscription",
      StatusCodes.BAD_REQUEST
    );

  // Calculate start & end date
  const start_date = new Date();
  const end_date = new Date(start_date);
  end_date.setDate(start_date.getDate() + plan.duration_in_days);

  const subscription = await prisma.subscription.create({
    data: {
      user_id: userId,
      plan_id,
      start_date,
      end_date,
      status: "active",
      payment_reference,
    },
    include: {
      plan: true,
    },
  });

  return apiResponse("Subscription created successfully", subscription);
};

// export const updateSubscriptionStatus = async (id: string, status: string) => {
//   const existing = await prisma.subscription.findUnique({ where: { id } });

//   if (!existing)
//     throw new ApiError("Subscription not found", StatusCodes.NOT_FOUND);

//   const updated = await prisma.subscription.update({
//     where: { id },
//     data: { status },
//     include: { plan: true },
//   });

//   return apiResponse("Subscription status updated successfully", updated);
// };

/**
 * Get user's active (current) subscription
 */
export const getUserActiveSubscription = async (userId: string) => {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      user_id: userId,
      status: "active",
      end_date: { gt: now },
    },
    include: {
      plan: true,
    },
  });

  if (!subscription)
    throw new ApiError("No active subscription found", StatusCodes.NOT_FOUND);

  return apiResponse("Active subscription fetched successfully", subscription);
};

/**
 * Automatically expire old subscriptions (to be run in a cron job)
 */
export const expireOldSubscriptions = async () => {
  const now = new Date();

  const expiredCount = await prisma.subscription.updateMany({
    where: {
      end_date: { lt: now },
      status: "active",
    },
    data: { status: "expired" },
  });

  return apiResponse(
    `${expiredCount.count} subscription(s) expired successfully`,
    null
  );
};

/**
 * Get all subscriptions (Admin only)
 */
export const getAllSubscriptions = async () => {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      plan: true,
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return apiResponse("Subscriptions fetched successfully", subscriptions);
};
