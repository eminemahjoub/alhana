import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Client } from "@/models/Client";
import { updateClientSchema } from "@/schemas/client";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const client = await Client.findById(id).lean();
  if (!client) return jsonError("Not found", 404);
  return jsonOk(client);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const updated = await Client.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const deleted = await Client.findByIdAndDelete(id).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

