import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Vehicle } from "@/models/Vehicle";
import { DataTable } from "@/components/data-table/data-table";
import { purchaseColumns, type PurchaseRow } from "./columns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  await dbConnect();
  void Vehicle;

  const rows = (
    (await PurchaseRequest.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("vehicleId", "matricule")
      .lean()) as unknown as Array<Omit<PurchaseRow, "_id"> & { _id: unknown }>
  ).map((r) => ({ ...r, _id: String(r._id) })) satisfies PurchaseRow[];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">طلبات المشتريات</h2>
          <p className="text-sm text-muted-foreground">Workflow: طلب → موافقة → تم الطلب → استلام.</p>
        </div>
        <Link
          href="/purchases/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
        >
          طلب مشتريات جديد
        </Link>
      </div>

      <DataTable columns={purchaseColumns} data={rows} searchPlaceholder="ابحث بعنوان الطلب..." searchColumnId="title" />
    </div>
  );
}

