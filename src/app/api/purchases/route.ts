import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Vehicle } from "@/models/Vehicle";
import { Maintenance } from "@/models/Maintenance";
import { createPurchaseSchema } from "@/schemas/purchase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function computeTotal(items: Array<{ qty: number; unitPriceSar?: number; totalSar?: number }>) {
  const safe = items.map((i) => ({
    qty: Number(i.qty) || 0,
    unitPriceSar: Number(i.unitPriceSar ?? 0) || 0,
    totalSar: Number(i.totalSar ?? 0) || 0,
  }));
  const sum = safe.reduce((acc, it) => acc + (it.totalSar || it.qty * it.unitPriceSar), 0);
  return Math.max(0, Math.round(sum * 100) / 100);
}

export async function GET() {
  await dbConnect();
  void Vehicle;
  void Maintenance;

  const rows = await PurchaseRequest.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("vehicleId", "matricule brand model")
    .populate("maintenanceId", "type performedAt")
    .lean();
  return jsonOk(rows);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createPurchaseSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const items = parsed.data.items ?? [];
  const totalSar = computeTotal(items);

  const now = new Date();
  const created = await PurchaseRequest.create({
    ...parsed.data,
    status: "submitted",
    submittedAt: now,
    items,
    totalSar,
  });
  return jsonOk(created, { status: 201 });
}

