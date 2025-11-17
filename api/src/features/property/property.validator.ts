import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  number_of_units: z.coerce.number().min(1, "Number of units is required"),
  is_public: z.coerce.boolean().default(false),
  verification_status: z
    .enum(["not_required", "pending", "approved", "rejected"])
    .default("not_required"),
  image: z.instanceof(File).optional(),
});

export type TypeCreateProperty = z.infer<typeof createPropertySchema>;
