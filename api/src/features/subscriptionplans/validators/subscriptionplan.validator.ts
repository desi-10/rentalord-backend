import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  duration_in_days: z
    .number()
    .int()
    .positive("Duration must be greater than 0"),
  features: z.string().optional(),
  max_properties: z.number().int().min(1, "At least 1 property allowed"),
  max_units: z.number().int().min(1, "At least 1 unit allowed"),
});

export const updateSubscritionPlanSchema =
  createSubscriptionPlanSchema.partial();

export const subscriptionParams = z.object({
  id: z.cuid(),
});

export type TypeCreateSubscriptionPlan = z.infer<
  typeof createSubscriptionPlanSchema
>;
export type TypeUpdateSubscriptionPlan = z.infer<
  typeof updateSubscritionPlanSchema
>;
