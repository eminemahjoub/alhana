import { z } from "zod";
import { MaintenanceTypes } from "@/constants/enums";

export const maintenanceAttachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().optional(),
  mime: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(10),
  type: z.enum(MaintenanceTypes),
  title: z.string().optional(),
  performedAt: z.coerce.date(),
  odometerKm: z.coerce.number().min(0).optional(),
  costSar: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(maintenanceAttachmentSchema).optional(),
  nextDueAt: z.coerce.date().optional(),
  nextDueKm: z.coerce.number().min(0).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

