import { z } from "zod";
import { TransportOrderStatuses } from "@/constants/enums";

export const addressSchema = z.object({
  label: z.string().optional(),
  addressLine: z.string().min(3),
  city: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const createTransportOrderSchema = z.object({
  orderNo: z.string().min(6),
  clientId: z.string().min(10),
  pickup: addressSchema,
  delivery: addressSchema,
  cargoType: z.string().min(2),
  weightKg: z.coerce.number().min(0),
  volumeM3: z.coerce.number().min(0).optional(),
  scheduledAt: z.coerce.date(),
  vehicleId: z.string().min(10).optional(),
  driverId: z.string().min(10).optional(),
  status: z.enum(TransportOrderStatuses).optional(),
  revenueDzd: z.coerce.number().min(0).optional(),
  costDzd: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateTransportOrderSchema = createTransportOrderSchema.partial();

