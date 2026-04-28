import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Maintenance } from "@/models/Maintenance";
import { updateMaintenanceSchema } from "@/schemas/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const row = await Maintenance.findById(id).lean();
  if (!row) return jsonError("Not found", 404);
  return jsonOk(row);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = updateMaintenanceSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const updated = await Maintenance.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const deleted = await Maintenance.findByIdAndDelete(id).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

