import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { dbConnect } from "@/lib/db";
import { TransportOrder } from "@/models/TransportOrder";
import "@/models/Client";
import "@/models/Vehicle";
import "@/models/Driver";
import { orderColumns, type OrderRow } from "./columns";

export default async function OrdersPage() {
  await dbConnect();
  const orders = await TransportOrder.find({})
    .sort({ scheduledAt: -1 })
    .limit(200)
    .populate("clientId", "name")
    .populate("vehicleId", "matricule")
    .populate("driverId", "fullName")
    .lean();

  const rows: OrderRow[] = (orders as unknown as Array<Record<string, unknown>>).map((o) => {
    const client = o.clientId as { name?: string } | undefined;
    const vehicle = o.vehicleId as { matricule?: string } | undefined;
    const driver = o.driverId as { fullName?: string } | undefined;
    return {
      _id: String(o._id),
      orderNo: String(o.orderNo),
      clientName: client?.name ?? "—",
      scheduledAt: new Date(String(o.scheduledAt)).toISOString(),
      status: o.status as OrderRow["status"],
      vehicle: vehicle?.matricule,
      driver: driver?.fullName,
      revenueDzd: typeof o.revenueDzd === "number" ? o.revenueDzd : Number(o.revenueDzd ?? 0),
    };
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">طلبات النقل</h2>
          <p className="text-sm text-muted-foreground">
            إنشاء الطلبات وتعيين سيارة + سائق وتتبع الحالات.
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow hover:opacity-95"
        >
          طلب نقل جديد
        </Link>
      </div>

      <DataTable columns={orderColumns} data={rows} searchPlaceholder="بحث..." searchColumnId="orderNo" />
    </div>
  );
}

