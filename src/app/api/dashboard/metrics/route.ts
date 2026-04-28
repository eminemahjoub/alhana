import { dbConnect } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { TransportOrder } from "@/models/TransportOrder";
import { Vehicle } from "@/models/Vehicle";

export async function GET() {
  await dbConnect();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [
    tripsToday,
    activeVehiclesOnRoad,
    delivered,
    totalOrdersToday,
    revenueAgg,
    vehiclesTotal,
    vehiclesMaintenance,
    vehiclesInactive,
    vehiclesActive,
  ] = await Promise.all([
    TransportOrder.countDocuments({ scheduledAt: { $gte: start, $lt: end } }),
    Vehicle.countDocuments({ status: { $in: ["on_road"] } }),
    TransportOrder.countDocuments({ status: "delivered", scheduledAt: { $gte: start, $lt: end } }),
    TransportOrder.countDocuments({ scheduledAt: { $gte: start, $lt: end } }),
    TransportOrder.aggregate([
      { $match: { scheduledAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, revenueDzd: { $sum: "$revenueDzd" } } },
    ]),
    Vehicle.countDocuments({}),
    Vehicle.countDocuments({ status: "maintenance", isActive: true }),
    Vehicle.countDocuments({ $or: [{ status: "out_of_service" }, { isActive: false }] }),
    Vehicle.countDocuments({ status: { $ne: "out_of_service" }, isActive: true }),
  ]);

  const deliveryRate = totalOrdersToday ? Math.round((delivered / totalOrdersToday) * 100) : 0;
  const revenueDzd = revenueAgg?.[0]?.revenueDzd ?? 0;

  return jsonOk({
    tripsToday,
    activeVehiclesOnRoad,
    deliveryRate,
    revenueDzd,
    vehiclesTotal,
    vehiclesActive,
    vehiclesMaintenance,
    vehiclesInactive,
  });
}

