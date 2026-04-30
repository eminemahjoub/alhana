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
    activeVehiclesOnRoad,
    delivered,
    totalOrdersToday,
    vehiclesTotal,
    vehiclesMaintenance,
    vehiclesInactive,
    vehiclesActive,
  ] = await Promise.all([
    Vehicle.countDocuments({ status: { $in: ["on_road"] } }),
    TransportOrder.countDocuments({ status: "delivered", scheduledAt: { $gte: start, $lt: end } }),
    TransportOrder.countDocuments({ scheduledAt: { $gte: start, $lt: end } }),
    Vehicle.countDocuments({}),
    Vehicle.countDocuments({ status: "maintenance", isActive: true }),
    Vehicle.countDocuments({ $or: [{ status: "out_of_service" }, { isActive: false }] }),
    Vehicle.countDocuments({ status: { $ne: "out_of_service" }, isActive: true }),
  ]);

  const deliveryRate = totalOrdersToday ? Math.round((delivered / totalOrdersToday) * 100) : 0;

  return jsonOk({
    activeVehiclesOnRoad,
    deliveryRate,
    vehiclesTotal,
    vehiclesActive,
    vehiclesMaintenance,
    vehiclesInactive,
  });
}

