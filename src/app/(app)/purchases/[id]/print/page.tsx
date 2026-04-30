import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Vehicle } from "@/models/Vehicle";
import { PrintClientActions } from "./print-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VehicleRef = { matricule?: string; brand?: string; model?: string };
type PurchaseItem = { name?: string; qty?: number };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown, fallback = "—") {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function getNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default async function PurchasePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();
  void Vehicle;

  const row = await PurchaseRequest.findById(id).populate("vehicleId", "matricule brand model").lean();
  if (!row) return notFound();

  const r = row as unknown as Record<string, unknown>;
  const title = getString(r.title, "طلب مشتريات");
  const supplier = getString(r.supplier);
  const notes = getString(r.notes);

  const vehicle = isRecord(r.vehicleId) ? (r.vehicleId as VehicleRef) : null;
  const vehicleLabel = vehicle
    ? [getString(vehicle.matricule, ""), getString(vehicle.brand, ""), getString(vehicle.model, "")]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";

  const itemsRaw = r.items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => (isRecord(it) ? (it as PurchaseItem) : ({} as PurchaseItem)))
    : [];

  const createdAt = (() => {
    const d = r.createdAt instanceof Date ? r.createdAt : new Date(String(r.createdAt ?? ""));
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ar-SA");
  })();

  return (
    <div className="mx-auto max-w-3xl space-y-6 bg-white p-6 text-black">
      <style>{`
        @media print {
          body { background: white !important; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      <PrintClientActions />

      <div className="print:hidden">
        <Link href={`/purchases/${id}`} className="text-sm underline">
          رجوع للتفاصيل
        </Link>
      </div>

      <header className="space-y-2 border-b pb-4">
        <div className="text-2xl font-extrabold">{title}</div>
        <div className="text-sm text-black/70">التاريخ: {createdAt}</div>
        {supplier !== "—" ? <div className="text-sm">المورّد: {supplier}</div> : null}
        {vehicleLabel ? <div className="text-sm">السيارة: {vehicleLabel}</div> : null}
        {notes !== "—" ? <div className="text-sm">ملاحظات: {notes}</div> : null}
      </header>

      <section className="space-y-3">
        <div className="text-sm font-bold">بنود الطلب</div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-black/5">
              <tr>
                <th className="px-3 py-2 text-right font-semibold">الصنف</th>
                <th className="px-3 py-2 text-right font-semibold w-24">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((it, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{getString(it.name)}</td>
                    <td className="px-3 py-2 tabular-nums" dir="ltr">
                      {getNumber(it.qty)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="px-3 py-6 text-center text-black/60" colSpan={2}>
                    لا توجد بنود.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

