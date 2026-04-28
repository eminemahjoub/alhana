import mongoose, { Schema, type InferSchemaType } from "mongoose";

import { VehicleStatuses } from "@/constants/enums";

const VehicleDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "gray_card",
        "insurance",
        "delegation",
        "technical_inspection",
        "form",
        "operation_card",
        "professional_card",
      ],
      required: true,
    },
    number: { type: String, trim: true },
    issuedAt: { type: Date },
    expiresAt: { type: Date, index: true },
    fileUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const VehicleSchema = new Schema(
  {
    matricule: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    trim: { type: String, trim: true }, // الطراز
    vehicleType: { type: String, trim: true }, // نوع السيارة
    fuelType: { type: String, trim: true }, // الوقود
    color: { type: String, trim: true },
    year: { type: Number, min: 1970, max: 2100, index: true },
    odometerKm: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: VehicleStatuses, default: "available", index: true },
    imageUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
    chassisNumber: { type: String, trim: true, index: true }, // رقم الهيكل
    serialNumber: { type: String, trim: true }, // الرقم التسلسلي
    ownerName: { type: String, trim: true }, // اسم المالك
    receiverName: { type: String, trim: true }, // اسم المستلم
    receiverIdNumber: { type: String, trim: true }, // رقم الهوية
    receiverMobile: { type: String, trim: true }, // رقم الجوال
    licenseType: { type: String, trim: true }, // نوع الرخصة
    licenseExpiresAt: { type: Date }, // صلاحية الرخصة
    receivedAt: { type: Date }, // تاريخ الاستلام
    insuranceType: { type: String, trim: true }, // نوع التأمين
    computerName: { type: String, trim: true }, // الحاسب الالي
    sectorLocation: { type: String, trim: true }, // القطاع والموقع
    carMode: { type: String, trim: true }, // وضع السيارة
    documents: { type: [VehicleDocumentSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

VehicleSchema.index({ brand: 1, model: 1, matricule: 1 });

export type VehicleDoc = InferSchemaType<typeof VehicleSchema> & { _id: mongoose.Types.ObjectId };

export const Vehicle =
  (mongoose.models.Vehicle as mongoose.Model<VehicleDoc>) ||
  mongoose.model<VehicleDoc>("Vehicle", VehicleSchema);

