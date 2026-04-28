import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Vehicle } from "@/models/Vehicle";
import { Driver } from "@/models/Driver";
import { VehicleAssignment } from "@/models/VehicleAssignment";
import { assignVehicleSchema } from "@/schemas/vehicle-assignment";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();

  const vehicle = await Vehicle.findById(id).select("_id").lean();
  if (!vehicle) return jsonError("Not found", 404);

  const rows = await VehicleAssignment.find({ vehicleId: id })
    .sort({ assignedAt: -1 })
    .limit(200)
    .populate("driverId")
    .lean();

  return jsonOk(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();

  const body = await req.json().catch(() => null);
  const parsed = assignVehicleSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const vehicle = await Vehicle.findById(id).select("_id").lean();
  if (!vehicle) return jsonError("Not found", 404);

  const driverId = parsed.data.driverId;
  if (!isValidObjectId(driverId)) return jsonError("Invalid driverId", 400);
  const driver = await Driver.findById(driverId).select("_id").lean();
  if (!driver) return jsonError("Driver not found", 404);

  const now = new Date();
  const assignedAt = parsed.data.assignedAt ?? now;

  // Close any current assignment before creating a new one.
  await VehicleAssignment.updateMany(
    { vehicleId: id, unassignedAt: { $exists: false } },
    { $set: { unassignedAt: assignedAt } }
  );
  await VehicleAssignment.updateMany(
    { vehicleId: id, unassignedAt: null },
    { $set: { unassignedAt: assignedAt } }
  );

  const created = await VehicleAssignment.create({
    vehicleId: id,
    driverId,
    assignedAt,
    reason: parsed.data.reason,
    notes: parsed.data.notes,
  });

  const populated = await VehicleAssignment.findById(created._id).populate("driverId").lean();
  return jsonOk(populated, { status: 201 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

