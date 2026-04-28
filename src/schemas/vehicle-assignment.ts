import { z } from "zod";

export const assignVehicleSchema = z.object({
  driverId: z.string().min(10),
  assignedAt: z.coerce.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const updateVehicleAssignmentSchema = z.object({
  unassignedAt: z.coerce.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

