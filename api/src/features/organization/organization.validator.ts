import { z } from "zod";

export const createOrganizationSchema = z.object({
  //   owner_id: z.cuid({ message: "Invalid owner ID format" }),
  organization_name: z
    .string({ error: "Organization name is required" })
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must not exceed 100 characters"),
  is_active: z.boolean().default(true),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const organizationParamsSchema = z.object({
  id: z.cuid({ message: "Invalid organization ID" }),
});

export type TypeCreateOrganization = z.infer<typeof createOrganizationSchema>;
export type TypeUpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type TypeOrganizationParams = z.infer<typeof organizationParamsSchema>;
