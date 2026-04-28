import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DriverSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    imageUrl: { type: String, trim: true },
    iqamaImageUrl: { type: String, trim: true },
    idNumber: { type: String, trim: true, index: true },
    licenseNumber: { type: String, required: true, trim: true, unique: true, index: true },
    licenseCategory: { type: String, trim: true },
    licenseExpiresAt: { type: Date, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

DriverSchema.index({ fullName: "text", phone: "text", licenseNumber: "text" });

export type DriverDoc = InferSchemaType<typeof DriverSchema> & { _id: mongoose.Types.ObjectId };

export const Driver =
  (mongoose.models.Driver as mongoose.Model<DriverDoc>) ||
  mongoose.model<DriverDoc>("Driver", DriverSchema);

