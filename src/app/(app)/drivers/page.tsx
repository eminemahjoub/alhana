import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { dbConnect } from "@/lib/db";
import { Driver } from "@/models/Driver";
import { driverColumns, type DriverRow } from "./columns";

export default async function DriversPage() {
  await dbConnect();
  const drivers = (
    (await Driver.find({}).sort({ createdAt: -1 }).lean()) as unknown as Array<
      Omit<DriverRow, "_id"> & { _id: unknown }
    >
  ).map((d) => ({ ...d, _id: String(d._id) })) satisfies DriverRow[];
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">السائقون</h2>
          <p className="text-sm text-muted-foreground">
            بيانات السائق، الهوية، الإقامة والرخصة.
          </p>
        </div>
        <Link
          href="/drivers/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
        >
          إضافة سائق
        </Link>
      </div>

      <DataTable
        columns={driverColumns}
        data={drivers}
        searchPlaceholder="ابحث باسم السائق..."
        searchColumnId="fullName"
      />
    </div>
  );
}

