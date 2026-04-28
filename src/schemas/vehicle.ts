import { z } from "zod";
import { VehicleStatuses } from "@/constants/enums";

export const vehicleDocumentSchema = z.object({
  type: z.enum([
    "gray_card",
    "insurance",
    "delegation",
    "technical_inspection",
    "form",
    "operation_card",
    "professional_card",
  ]),
  number: z.string().optional(),
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const createVehicleSchema = z.object({
  matricule: z.string().min(3),
  brand: z.string().min(2),
  model: z.string().min(1),
  trim: z.string().optional(),
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
  color: z.string().optional(),
  year: z.coerce.number().int().min(1970).max(2100).optional(),
  odometerKm: z.coerce.number().min(0).optional(),
  status: z.enum(VehicleStatuses).optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
  chassisNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  ownerName: z.string().optional(),
  receiverName: z.string().optional(),
  receiverIdNumber: z.string().optional(),
  receiverMobile: z.string().optional(),
  licenseType: z.string().optional(),
  licenseExpiresAt: z.coerce.date().optional(),
  receivedAt: z.coerce.date().optional(),
  insuranceType: z.string().optional(),
  computerName: z.string().optional(),
  sectorLocation: z.string().optional(),
  carMode: z.string().optional(),
  documents: z.array(vehicleDocumentSchema).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

