import { z } from "zod";

// ENUMS — match your Prisma enums
export const UnitTypeEnum = z.enum([
  "room",
  "apartment",
  "office",
  "shop",
  "container",
  "other",
]);

export const UnitStatusEnum = z.enum(["available", "occupied", "maintenance"]);

export const createUnitSchema = z.object({
  property_id: z.cuid(),
  name: z.string().min(1, "Unit name is required"),
  type: UnitTypeEnum,
  rent_amount: z.coerce.number().min(0),
  status: UnitStatusEnum.optional(),
  description: z.string().optional(),
  is_public: z
    .string()
    .transform((val) => (val === "true" ? true : false))
    .default(false),
  images: z
    .array(
      z
        .any()
        .transform((val) => {
          if (val instanceof File) return val;
          if (val === "" || val === "null" || val === undefined) return null;
          return null;
        })
        .nullable()
        .optional()
    )
    .optional()
    .optional(),

  // Optional nested data
  tenancies: z
    .array(
      z.object({
        tenant_id: z.cuid(),
        landlord_id: z.cuid(),
        start_date: z.coerce.date(),
        end_date: z.coerce.date().optional(),
        duration_in_months: z.number().min(1),
        rent_amount: z.coerce.number().min(0),
        payment_frequency: z
          .enum(["daily", "weekly", "monthly", "yearly"])
          .default("monthly"),
        security_deposit: z.coerce.number().optional(),
        status: z
          .enum(["pending", "active", "ended", "terminated"])
          .default("pending"),
        notes: z.string().optional(),
      })
    )
    .optional(),

  maintenanceRequests: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        status: z
          .enum(["pending", "in_progress", "resolved", "cancelled"])
          .default("pending"),
        reported_by: z.cuid(),
        assigned_to: z.cuid().optional(),
      })
    )
    .optional(),
});

export const unitIdParams = z.object({
  unitId: z.cuid("Invalid unit ID format"),
});

export const updateUnitSchema = createUnitSchema.partial();

export type TypeUnitSchema = z.infer<typeof createUnitSchema>;
export type TypeUpdateUnitSchema = z.infer<typeof updateUnitSchema>;
