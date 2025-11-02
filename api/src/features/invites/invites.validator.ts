// src/validations/property-invite.schema.ts
import { z } from "zod";

export const createInviteSchema = z.object({
  property_id: z.cuid(),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .optional(),
  role: z.enum(["tenant", "manager"]),
});

export const updateInviteSchema = z.object({
  id: z.cuid(),
  //   role: z.enum(["landlord", "manager", "tenant"]).optional(),
  role: z.enum(["manager", "tenant"]).optional(),
  status: z.enum(["pending", "accepted", "expired", "revoked"]).optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10, "Invalid token"),
  user_id: z.cuid(), // the user accepting the invite
});

export type TypeCreateInvite = z.infer<typeof createInviteSchema>;
export type TypeUpdateInvite = z.infer<typeof updateInviteSchema>;
export type TypeAcceptInvite = z.infer<typeof acceptInviteSchema>;
