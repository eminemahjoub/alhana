import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { TransportOrder } from "@/models/TransportOrder";
import { createTransportOrderSchema } from "@/schemas/order";

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderNo: new RegExp(q, "i") },
      { cargoType: new RegExp(q, "i") },
      { "pickup.city": new RegExp(q, "i") },
      { "delivery.city": new RegExp(q, "i") },
    ];
  }

  const orders = await TransportOrder.find(filter)
    .sort({ scheduledAt: -1 })
    .limit(200)
    .populate("clientId", "name city")
    .populate("vehicleId", "matricule brand model status")
    .populate("driverId", "fullName phone")
    .lean();

  return jsonOk(orders);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createTransportOrderSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const created = await TransportOrder.create(parsed.data);
  return jsonOk(created, { status: 201 });
}

