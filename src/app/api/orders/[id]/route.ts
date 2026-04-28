import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { TransportOrder } from "@/models/TransportOrder";
import { updateTransportOrderSchema } from "@/schemas/order";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const order = await TransportOrder.findById(id)
    .populate("clientId", "name city phone")
    .populate("vehicleId", "matricule brand model status")
    .populate("driverId", "fullName phone")
    .lean();
  if (!order) return jsonError("Not found", 404);
  return jsonOk(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = updateTransportOrderSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const updated = await TransportOrder.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return jsonError("Not found", 404);
  return jsonOk(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const deleted = await TransportOrder.findByIdAndDelete(id).lean();
  if (!deleted) return jsonError("Not found", 404);
  return jsonOk({ deleted: true });
}

