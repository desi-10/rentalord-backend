import { z } from "zod";

export const createBusinessSchema = z.object({
  //   owner_id: z.cuid({ message: "Invalid owner ID format" }),
  business_name: z
    .string({ error: "Business name is required" })
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  is_active: z.boolean().default(true),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const businessParamsSchema = z.object({
  id: z.cuid({ message: "Invalid business ID" }),
});

export type TypeCreateBusiness = z.infer<typeof createBusinessSchema>;
export type TypeUpdateBusiness = z.infer<typeof updateBusinessSchema>;
export type TypeBusinessParams = z.infer<typeof businessParamsSchema>;
