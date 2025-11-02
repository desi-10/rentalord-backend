import z from "zod";

export const createUserSchema = z.object({
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string(),
  last_name: z.string(),
  email: z.email(),
  is_verified: z.boolean(),
});

export const updateUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.email().optional(),
});

export const userParamsSchema = z.object({
  id: z.cuid("Invalid user ID format"),
});

export type TypeUser = z.infer<typeof createUserSchema>;
export type TypeUserUpdate = z.infer<typeof updateUserSchema>;
