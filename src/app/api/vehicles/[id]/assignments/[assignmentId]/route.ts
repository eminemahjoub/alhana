import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { VehicleAssignment } from "@/models/VehicleAssignment";
import { updateVehicleAssignmentSchema } from "@/schemas/vehicle-assignment";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await Promise.resolve(params);
  if (!isValidObjectId(id) || !isValidObjectId(assignmentId)) return jsonError("Invalid id", 400);
  await dbConnect();

  const body = await req.json().catch(() => null);
  const parsed = updateVehicleAssignmentSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const updated = await VehicleAssignment.findOneAndUpdate(
    { _id: assignmentId, vehicleId: id },
    parsed.data,
    { new: true }
  )
    .populate("driverId")
    .lean();

  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await Promise.resolve(params);
  if (!isValidObjectId(id) || !isValidObjectId(assignmentId)) return jsonError("Invalid id", 400);
  await dbConnect();

  const deleted = await VehicleAssignment.findOneAndDelete({ _id: assignmentId, vehicleId: id }).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

