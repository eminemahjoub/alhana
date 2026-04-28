import mongoose, { Schema, type InferSchemaType } from "mongoose";

import { MaintenanceTypes } from "@/constants/enums";

const MaintenanceAttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    mime: { type: String, trim: true },
  },
  { _id: false }
);

const MaintenanceSchema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    type: { type: String, enum: MaintenanceTypes, required: true, index: true },
    title: { type: String, trim: true },
    performedAt: { type: Date, required: true, index: true },
    odometerKm: { type: Number, min: 0 },
    costSar: { type: Number, min: 0, default: 0 },
    // legacy (kept for old data)
    costDzd: { type: Number, min: 0, default: 0, select: false },
    supplier: { type: String, trim: true },
    notes: { type: String, trim: true },
    attachments: { type: [MaintenanceAttachmentSchema], default: [] },
    nextDueAt: { type: Date, index: true },
    nextDueKm: { type: Number, min: 0 },
  },
  { timestamps: true }
);

MaintenanceSchema.index({ vehicleId: 1, performedAt: -1 });

export type MaintenanceDoc = InferSchemaType<typeof MaintenanceSchema> & { _id: mongoose.Types.ObjectId };

export const Maintenance =
  (mongoose.models.Maintenance as mongoose.Model<MaintenanceDoc>) ||
  mongoose.model<MaintenanceDoc>("Maintenance", MaintenanceSchema);

