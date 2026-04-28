import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { dbConnect } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";
import { vehicleColumns, type VehicleRow } from "./columns";

export default async function FleetPage() {
  await dbConnect();
  const vehicles = (
    (await Vehicle.find({}).sort({ createdAt: -1 }).lean()) as unknown as Array<
      Omit<VehicleRow, "_id"> & { _id: unknown }
    >
  ).map((v) => ({ ...v, _id: String(v._id) })) satisfies VehicleRow[];
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">إدارة الأسطول</h2>
          <p className="text-sm text-muted-foreground">
            سيارات الشركة مع الحالة، الكيلومتراج، والوثائق.
          </p>
        </div>
        <Link
          href="/fleet/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
        >
          إضافة سيارة
        </Link>
      </div>

      <DataTable
        columns={vehicleColumns}
        data={vehicles}
        searchPlaceholder="ابحث باللوحة..."
        searchColumnId="matricule"
      />
    </div>
  );
}

