import z from "zod";

export const maintenanceRequestsSchema = z.object({
  title: z.string().min(1, ""),
  description: z.string().min(1, ""),
  property_id: z.cuid(),
  unit_id: z.string().optional(),
  tenancy_id: z.string().optional(),
  requested_by: z.cuid(),
  request_date: z.coerce.date(),
  resolved_date: z.coerce.date(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z
    .enum(["pending", "in_progress", "resolved", "cancelled"])
    .default("pending"),
  reported_by: z.cuid(),
  assigned_to: z.cuid().optional(),
});

export type TypeMaintenanceRequest = z.infer<typeof maintenanceRequestsSchema>;
