import { z } from "zod";
import { DriverStatuses } from "@/constants/enums";

export const createDriverSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().optional(),
  imageUrl: z.string().url().optional(),
  licenseNumber: z.string().min(3),
  licenseCategory: z.string().optional(),
  licenseExpiresAt: z.coerce.date().optional(),
  status: z.enum(DriverStatuses).optional(),
  isAvailable: z.coerce.boolean().optional(),
  notes: z.string().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

