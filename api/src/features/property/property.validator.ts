import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  // number_of_units: z.coerce.number().min(1, "Number of units is required"),
  is_public: z.coerce.boolean().default(false),
  verification_status: z
    .enum(["not_required", "pending", "approved", "rejected"])
    .default("not_required"),
  image: z
    .any()
    .transform((val) => {
      if (val instanceof File) return val;
      if (val === "" || val === "null" || val === undefined) return null;
      return null;
    })
    .nullable()
    .optional(),
});

export const updatePropertySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  description: z.string().optional(),
  number_of_units: z.coerce
    .number()
    .min(1, "Number of units is required")
    .optional(),
  is_public: z.coerce.boolean().default(false).optional(),
  verification_status: z
    .enum(["not_required", "pending", "approved", "rejected"])
    .default("not_required")
    .optional(),
  image: z
    .any()
    .transform((val) => {
      if (val instanceof File) return val;
      if (val === "" || val === "null" || val === undefined) return null;
      return null;
    })
    .nullable()
    .optional(),
});

export const propertyIdParams = z.object({
  propertyId: z.cuid("Invalid property ID format"),
});

export type TypeCreateProperty = z.infer<typeof createPropertySchema>;
export type TypeUpdateProperty = z.infer<typeof updatePropertySchema>;
export type TypePropertyIdParams = z.infer<typeof propertyIdParams>;
