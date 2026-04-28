import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Maintenance } from "@/models/Maintenance";
import { Vehicle } from "@/models/Vehicle";
import { DataTable } from "@/components/data-table/data-table";
import { maintenanceColumns, type MaintenanceRow } from "./columns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  await dbConnect();
  void Vehicle;

  const rows = (
    (await Maintenance.find({})
      .sort({ performedAt: -1 })
      .limit(200)
      .populate("vehicleId", "matricule brand model status")
      .lean()) as unknown as Array<Omit<MaintenanceRow, "_id"> & { _id: unknown }>
  ).map((r) => ({ ...r, _id: String(r._id) })) satisfies MaintenanceRow[];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">الصيانة والتقارير</h2>
          <p className="text-sm text-muted-foreground">سجل تبديل الزيت، الصيانة، تقارير الميكانيك والتصليح مع المرفقات.</p>
        </div>
        <Link
          href="/maintenance/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
        >
          إضافة تقرير
        </Link>
      </div>

      <DataTable columns={maintenanceColumns} data={rows} searchPlaceholder="ابحث بعنوان التقرير..." searchColumnId="title" />
    </div>
  );
}

