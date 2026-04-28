import { z } from "zod";
import { PurchaseStatuses } from "@/constants/enums";

export const purchaseAttachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().optional(),
  mime: z.string().optional(),
});

export const purchaseItemSchema = z.object({
  name: z.string().min(1),
  qty: z.coerce.number().min(0),
  unitPriceSar: z.coerce.number().min(0),
  totalSar: z.coerce.number().min(0),
});

export const createPurchaseSchema = z.object({
  title: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  vehicleId: z.string().optional(),
  maintenanceId: z.string().optional(),
  items: z.array(purchaseItemSchema).optional(),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();

export const purchaseActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("order") }),
  z.object({ action: z.literal("receive"), receiptAttachments: z.array(purchaseAttachmentSchema).optional() }),
  z.object({
    action: z.literal("invoice"),
    invoiceNumber: z.string().optional(),
    invoiceAttachments: z.array(purchaseAttachmentSchema).optional(),
  }),
  z.object({
    action: z.literal("pay"),
    paymentMethod: z.string().optional(),
    paymentRef: z.string().optional(),
    paymentAttachments: z.array(purchaseAttachmentSchema).optional(),
  }),
  z.object({ action: z.literal("cancel") }),
]);

export const purchaseStatusSchema = z.enum(PurchaseStatuses);

