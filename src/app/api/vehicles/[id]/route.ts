import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Vehicle } from "@/models/Vehicle";
import { updateVehicleSchema } from "@/schemas/vehicle";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const vehicle = await Vehicle.findById(id).lean();
  if (!vehicle) return jsonError("Not found", 404);
  return jsonOk(vehicle);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = updateVehicleSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const updated = await Vehicle.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const deleted = await Vehicle.findByIdAndDelete(id).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

