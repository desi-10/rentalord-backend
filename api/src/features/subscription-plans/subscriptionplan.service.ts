// src/services/subscription.service.ts
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/api-error.js";
import { apiResponse } from "../../utils/api-response.js";
import { prisma } from "../../utils/db.js";
import {
  TypeCreateSubscriptionPlan,
  TypeUpdateSubscriptionPlan,
} from "./subscriptionplan.validator.js";

/**
 * Create a new subscription plan
 */
export const createSubscriptionPlanService = async (
  data: TypeCreateSubscriptionPlan
) => {
  const { name, price, duration_in_days, features, max_properties, max_units } =
    data;

  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { name },
  });

  if (existingPlan) {
    throw new ApiError(
      "A plan with this name already exists",
      StatusCodes.CONFLICT
    );
  }

  // ✅ Create plan
  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      price,
      duration_in_days,
      features,
      max_properties,
      max_units,
    },
  });

  // ✅ Return formatted response
  return apiResponse("Subscription plan created successfully", plan);
};

export const getAllSubscriptionPlans = async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { created_at: "desc" },
  });

  return apiResponse("Subscription plans fetched successfully", plans);
};

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanById = async (id: string) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new ApiError("Subscription plan not found", StatusCodes.NOT_FOUND);
  }

  return apiResponse("Subscription plan fetched successfully", plan);
};

export const updateSubscriptionPlanService = async (
  id: string,
  data: TypeUpdateSubscriptionPlan
) => {
  // Check if plan exists
  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!existingPlan)
    throw new ApiError("Subscription plan not found", StatusCodes.NOT_FOUND);

  // Prevent name conflict
  if (data.name && data.name !== existingPlan.name) {
    const duplicate = await prisma.subscriptionPlan.findUnique({
      where: { name: data.name },
    });

    if (duplicate)
      throw new ApiError(
        "Another plan with this name already exists",
        StatusCodes.CONFLICT
      );
  }

  const updatedPlan = await prisma.subscriptionPlan.update({
    where: { id },
    data,
  });

  return apiResponse("Subscription plan updated successfully", updatedPlan);
};

export const deleteSubscriptionPlanService = async (id: string) => {
  // ✅ Check existence
  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!existingPlan)
    throw new ApiError("Subscription plan not found", StatusCodes.NOT_FOUND);

  // ✅ Optional: Check if plan has active subscriptions before deleting
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      plan_id: id,
      status: { in: ["active", "canceled"] },
    },
  });

  if (activeSubscriptions > 0)
    throw new ApiError(
      "Cannot delete a plan with active subscriptions",
      StatusCodes.BAD_REQUEST
    );

  // ✅ Delete the plan
  await prisma.subscriptionPlan.delete({
    where: { id },
  });

  return apiResponse("Subscription plan deleted successfully");
};
