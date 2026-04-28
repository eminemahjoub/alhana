import mongoose, { Schema, type InferSchemaType } from "mongoose";

import { TripStatuses } from "@/constants/enums";

const TripEventSchema = new Schema(
  {
    at: { type: Date, required: true, index: true },
    status: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const TripSchema = new Schema(
  {
    tripNo: { type: String, required: true, trim: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "TransportOrder", required: true, unique: true, index: true },

    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true, index: true },

    status: { type: String, enum: TripStatuses, default: "planned", index: true },

    plannedStartAt: { type: Date, index: true },
    plannedEndAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },

    distanceKm: { type: Number, min: 0 },
    events: { type: [TripEventSchema], default: [] },
  },
  { timestamps: true }
);

TripSchema.index({ plannedStartAt: -1, status: 1 });

export type TripDoc = InferSchemaType<typeof TripSchema> & { _id: mongoose.Types.ObjectId };

export const Trip =
  (mongoose.models.Trip as mongoose.Model<TripDoc>) || mongoose.model<TripDoc>("Trip", TripSchema);

