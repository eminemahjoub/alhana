import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { PurchaseStatuses } from "@/constants/enums";

const PurchaseItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 0 },
    // legacy fields (prices removed from purchase requests UI)
    unitPriceSar: { type: Number, min: 0, default: 0 },
    totalSar: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    mime: { type: String, trim: true },
  },
  { _id: false }
);

const PurchaseRequestSchema = new Schema(
  {
    status: { type: String, enum: PurchaseStatuses, default: "submitted", index: true },

    title: { type: String, trim: true },
    supplier: { type: String, trim: true, index: true },
    notes: { type: String, trim: true },

    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", index: true },
    maintenanceId: { type: Schema.Types.ObjectId, ref: "Maintenance", index: true },

    items: { type: [PurchaseItemSchema], default: [] },
    totalSar: { type: Number, min: 0, default: 0 },

    submittedAt: { type: Date, index: true },
    approvedAt: { type: Date, index: true },
    orderedAt: { type: Date, index: true },
    receivedAt: { type: Date, index: true },

    receiptAttachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

PurchaseRequestSchema.index({ status: 1, createdAt: -1 });
PurchaseRequestSchema.index({ supplier: "text", title: "text" });

export type PurchaseRequestDoc = InferSchemaType<typeof PurchaseRequestSchema> & { _id: mongoose.Types.ObjectId };

export const PurchaseRequest =
  (mongoose.models.PurchaseRequest as mongoose.Model<PurchaseRequestDoc>) ||
  mongoose.model<PurchaseRequestDoc>("PurchaseRequest", PurchaseRequestSchema);

