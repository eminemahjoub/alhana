import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Maintenance } from "@/models/Maintenance";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { TransportOrder } from "@/models/TransportOrder";
import { Vehicle } from "@/models/Vehicle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDateParam(v: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  await dbConnect();
  void Vehicle;

  const url = new URL(req.url);
  const startRaw = url.searchParams.get("start");
  const endRaw = url.searchParams.get("end");

  const now = new Date();
  const end = parseDateParam(endRaw) ?? now;
  const start = parseDateParam(startRaw) ?? (() => {
    const d = new Date(end);
    d.setDate(d.getDate() - 29);
    return d;
  })();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  if (start > end) return jsonError("Invalid date range", 422);

  const [maintenanceAgg, maintenanceByType, maintenanceTopVehicles, purchasesByStatus, purchasesCount, ordersCostAgg] =
    await Promise.all([
      Maintenance.aggregate([
        { $match: { performedAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalCostSar: { $sum: "$costSar" }, count: { $sum: 1 } } },
      ]),
      Maintenance.aggregate([
        { $match: { performedAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$type", costSar: { $sum: "$costSar" }, count: { $sum: 1 } } },
        { $sort: { costSar: -1 } },
      ]),
      Maintenance.aggregate([
        { $match: { performedAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$vehicleId", costSar: { $sum: "$costSar" }, count: { $sum: 1 } } },
        { $sort: { costSar: -1 } },
        { $limit: 10 },
      ]),
      PurchaseRequest.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PurchaseRequest.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      TransportOrder.aggregate([
        { $match: { scheduledAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalCost: { $sum: "$costDzd" }, count: { $sum: 1 } } },
      ]),
    ]);

  const topVehicleIds = (maintenanceTopVehicles as Array<{ _id: unknown }>).map((x) => String(x._id ?? "")).filter(Boolean);
  const vehicles = topVehicleIds.length
    ? await Vehicle.find({ _id: { $in: topVehicleIds } }).select("matricule brand model").lean()
    : [];
  const vehicleMap = new Map<string, { matricule?: string; brand?: string; model?: string }>();
  for (const v of vehicles as unknown as Array<Record<string, unknown>>) {
    vehicleMap.set(String(v._id), {
      matricule: typeof v.matricule === "string" ? v.matricule : undefined,
      brand: typeof v.brand === "string" ? v.brand : undefined,
      model: typeof v.model === "string" ? v.model : undefined,
    });
  }

  const topVehicles = (maintenanceTopVehicles as Array<{ _id: unknown; costSar?: number; count?: number }>).map((x) => {
    const id = String(x._id ?? "");
    return {
      vehicleId: id,
      vehicle: vehicleMap.get(id) ?? null,
      costSar: Number(x.costSar ?? 0),
      count: Number(x.count ?? 0),
    };
  });

  const maint0 = maintenanceAgg?.[0] as { totalCostSar?: number; count?: number } | undefined;
  const ord0 = ordersCostAgg?.[0] as { totalCost?: number; count?: number } | undefined;

  return jsonOk({
    range: { start: start.toISOString(), end: end.toISOString() },
    maintenance: {
      totalCostSar: Number(maint0?.totalCostSar ?? 0),
      count: Number(maint0?.count ?? 0),
      byType: (maintenanceByType as Array<{ _id: string; costSar?: number; count?: number }>).map((x) => ({
        type: String(x._id ?? "other"),
        costSar: Number(x.costSar ?? 0),
        count: Number(x.count ?? 0),
      })),
      topVehicles,
    },
    purchases: {
      count: Number(purchasesCount ?? 0),
      byStatus: (purchasesByStatus as Array<{ _id: string; count?: number }>).map((x) => ({
        status: String(x._id ?? "unknown"),
        count: Number(x.count ?? 0),
      })),
    },
    orders: {
      count: Number(ord0?.count ?? 0),
      totalCostSar: Number(ord0?.totalCost ?? 0),
    },
  });
}

