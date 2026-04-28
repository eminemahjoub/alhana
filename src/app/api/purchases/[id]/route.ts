import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { purchaseActionSchema, updatePurchaseSchema } from "@/schemas/purchase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function computeTotal(items: Array<{ qty: number; unitPriceSar: number; totalSar: number }>) {
  const safe = items.map((i) => ({
    qty: Number(i.qty) || 0,
    unitPriceSar: Number(i.unitPriceSar) || 0,
    totalSar: Number(i.totalSar) || 0,
  }));
  const sum = safe.reduce((acc, it) => acc + (it.totalSar || it.qty * it.unitPriceSar), 0);
  return Math.max(0, Math.round(sum * 100) / 100);
}

type Attachment = { url: string; name?: string; mime?: string };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const row = await PurchaseRequest.findById(id).lean();
  if (!row) return jsonError("Not found", 404);
  return jsonOk(row);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid payload", 422);

  // action transitions
  if (typeof body === "object" && body && "action" in (body as Record<string, unknown>)) {
    const parsed = purchaseActionSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

    const doc = await PurchaseRequest.findById(id);
    if (!doc) return jsonError("Not found", 404);

    const now = new Date();
    const st = doc.status;
    const action = parsed.data.action;

    if (action === "approve") {
      if (st !== "submitted") return jsonError("Invalid transition", 409);
      doc.status = "approved";
      doc.approvedAt = now;
    } else if (action === "order") {
      if (st !== "approved") return jsonError("Invalid transition", 409);
      doc.status = "ordered";
      doc.orderedAt = now;
    } else if (action === "receive") {
      if (st !== "ordered") return jsonError("Invalid transition", 409);
      doc.status = "received";
      doc.receivedAt = now;
      if (parsed.data.receiptAttachments) {
        doc.set("receiptAttachments", parsed.data.receiptAttachments satisfies Attachment[]);
      }
    } else if (action === "invoice") {
      if (st !== "received") return jsonError("Invalid transition", 409);
      doc.status = "invoiced";
      doc.invoicedAt = now;
      doc.invoiceNumber = parsed.data.invoiceNumber ?? doc.invoiceNumber;
      if (parsed.data.invoiceAttachments) {
        doc.set("invoiceAttachments", parsed.data.invoiceAttachments satisfies Attachment[]);
      }
    } else if (action === "pay") {
      if (st !== "invoiced") return jsonError("Invalid transition", 409);
      doc.status = "paid";
      doc.paidAt = now;
      doc.paymentMethod = parsed.data.paymentMethod ?? doc.paymentMethod;
      doc.paymentRef = parsed.data.paymentRef ?? doc.paymentRef;
      if (parsed.data.paymentAttachments) {
        doc.set("paymentAttachments", parsed.data.paymentAttachments satisfies Attachment[]);
      }
    } else if (action === "cancel") {
      if (st === "paid" || st === "cancelled") return jsonError("Invalid transition", 409);
      doc.status = "cancelled";
    }

    await doc.save();
    return jsonOk(doc.toObject());
  }

  // regular update (draft/submitted only)
  const parsed = updatePurchaseSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const current = await PurchaseRequest.findById(id);
  if (!current) return jsonError("Not found", 404);
  if (current.status !== "draft" && current.status !== "submitted") return jsonError("Locked", 409);

  if (parsed.data.title !== undefined) current.title = parsed.data.title;
  if (parsed.data.supplier !== undefined) current.supplier = parsed.data.supplier;
  if (parsed.data.notes !== undefined) current.notes = parsed.data.notes;
  if (parsed.data.vehicleId !== undefined) current.set("vehicleId", parsed.data.vehicleId);
  if (parsed.data.maintenanceId !== undefined) current.set("maintenanceId", parsed.data.maintenanceId);
  if (parsed.data.items !== undefined) {
    current.set("items", parsed.data.items);
    const items = (current.get("items") as unknown) as Array<{ qty: number; unitPriceSar: number; totalSar: number }>;
    current.totalSar = computeTotal(items);
  }

  await current.save();
  return jsonOk(current.toObject());
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  await dbConnect();
  const current = await PurchaseRequest.findById(id).select("status").lean();
  if (!current) return jsonError("Not found", 404);
  if (current.status !== "draft" && current.status !== "submitted") return jsonError("Locked", 409);
  await PurchaseRequest.findByIdAndDelete(id);
  return jsonOk({ deleted: true });
}

