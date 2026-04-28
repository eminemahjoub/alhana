import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Driver } from "@/models/Driver";
import { updateDriverSchema } from "@/schemas/driver";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const driver = await Driver.findById(id).lean();
  if (!driver) return jsonError("Not found", 404);
  return jsonOk(driver);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = updateDriverSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const updated = await Driver.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const deleted = await Driver.findByIdAndDelete(id).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

