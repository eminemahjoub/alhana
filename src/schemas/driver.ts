import { z } from "zod";
export const createDriverSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().optional(),
  imageUrl: z.string().url().optional(),
  iqamaImageUrl: z.string().url().optional(),
  idNumber: z.string().optional(),
  licenseNumber: z.string().min(3),
  licenseCategory: z.string().optional(),
  licenseExpiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

