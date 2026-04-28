import mongoose, { Schema, type InferSchemaType } from "mongoose";

const VehicleAssignmentSchema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true, index: true },
    assignedAt: { type: Date, required: true, index: true },
    unassignedAt: { type: Date, index: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

VehicleAssignmentSchema.index({ vehicleId: 1, assignedAt: -1 });
VehicleAssignmentSchema.index({ vehicleId: 1, unassignedAt: 1, assignedAt: -1 });

export type VehicleAssignmentDoc = InferSchemaType<typeof VehicleAssignmentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VehicleAssignment =
  (mongoose.models.VehicleAssignment as mongoose.Model<VehicleAssignmentDoc>) ||
  mongoose.model<VehicleAssignmentDoc>("VehicleAssignment", VehicleAssignmentSchema);

