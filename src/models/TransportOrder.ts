import mongoose, { Schema, type InferSchemaType } from "mongoose";

import { TransportOrderStatuses } from "@/constants/enums";

const AddressSchema = new Schema(
  {
    label: { type: String, trim: true }, // اسم المستودع/الزبون/نقطة
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, trim: true, index: true },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const TransportOrderSchema = new Schema(
  {
    orderNo: { type: String, required: true, trim: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },

    pickup: { type: AddressSchema, required: true },
    delivery: { type: AddressSchema, required: true },

    cargoType: { type: String, required: true, trim: true, index: true },
    weightKg: { type: Number, required: true, min: 0 },
    volumeM3: { type: Number, min: 0 },

    scheduledAt: { type: Date, required: true, index: true },
    approvedAt: { type: Date },
    cancelledAt: { type: Date },
    deliveredAt: { type: Date },

    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", index: true },

    status: { type: String, enum: TransportOrderStatuses, default: "new", index: true },

    revenueDzd: { type: Number, min: 0, default: 0 },
    costDzd: { type: Number, min: 0, default: 0 },
    marginDzd: { type: Number, default: 0 },

    notes: { type: String, trim: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

TransportOrderSchema.index({ scheduledAt: -1, status: 1 });
TransportOrderSchema.index({ "pickup.city": 1, "delivery.city": 1 });
TransportOrderSchema.pre("save", function () {
  this.marginDzd = (this.revenueDzd ?? 0) - (this.costDzd ?? 0);
});

export type TransportOrderDoc = InferSchemaType<typeof TransportOrderSchema> & { _id: mongoose.Types.ObjectId };

export const TransportOrder =
  (mongoose.models.TransportOrder as mongoose.Model<TransportOrderDoc>) ||
  mongoose.model<TransportOrderDoc>("TransportOrder", TransportOrderSchema);

