import z from "zod";

export const createSubscriptionSchema = z.object({
  user_id: z.cuid(),
  plan_id: z.cuid(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  payment_reference: z.string().optional(),
});

export const updateSubscriptionStatusSchema = z.object({
  id: z.cuid(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "CANCELLED"]),
});

export type TypeCreateSubscription = z.infer<typeof createSubscriptionSchema>;
