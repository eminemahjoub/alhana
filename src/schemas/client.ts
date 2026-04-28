import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateClientSchema = createClientSchema.partial();

