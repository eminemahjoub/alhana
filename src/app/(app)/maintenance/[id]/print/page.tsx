import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Maintenance } from "@/models/Maintenance";
import { Vehicle } from "@/models/Vehicle";
import { PrintClientActions } from "./print-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VehicleRef = { matricule?: string; brand?: string; model?: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown, fallback = "—") {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function getNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  return Number.isFinite(n) ? n : null;
}

function getDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default async function MaintenancePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();
  void Vehicle;

  const row = await Maintenance.findById(id).populate("vehicleId", "matricule brand model").lean();
  if (!row) return notFound();

  const r = row as unknown as Record<string, unknown>;
  const vehicle = isRecord(r.vehicleId) ? (r.vehicleId as VehicleRef) : null;

  const performedAt = getDate(r.performedAt);
  const attachments = (() => {
    const raw = r.attachments;
    return Array.isArray(raw) ? raw.filter(isRecord) : [];
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
        <Link href={`/maintenance/${id}`} className="text-sm underline">
          رجوع للتفاصيل
        </Link>
      </div>

      <header className="space-y-2 border-b pb-4">
        <div className="text-2xl font-extrabold">{getString(r.title, "تقرير صيانة")}</div>
        <div className="text-sm text-black/70">التاريخ: {performedAt ? performedAt.toLocaleDateString("ar-SA") : "—"}</div>
        {vehicle?.matricule ? (
          <div className="text-sm">
            السيارة: {getString(vehicle.matricule)} {getString(vehicle.brand, "")} {getString(vehicle.model, "")}
          </div>
        ) : null}
      </header>

      <section className="space-y-3">
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-t">
                <td className="px-3 py-2 font-semibold bg-black/5 w-40">النوع</td>
                <td className="px-3 py-2">{getString(r.type)}</td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-semibold bg-black/5">الكيلومتراج</td>
                <td className="px-3 py-2 tabular-nums" dir="ltr">
                  {(() => {
                    const km = getNumber(r.odometerKm);
                    return km === null ? "—" : `${km.toLocaleString("fr-DZ")} كم`;
                  })()}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-semibold bg-black/5">التكلفة</td>
                <td className="px-3 py-2 tabular-nums" dir="ltr">
                  {(() => {
                    const c = getNumber(r.costSar);
                    return c === null ? "—" : `${c.toLocaleString("ar-SA")} SAR`;
                  })()}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-semibold bg-black/5">المورّد</td>
                <td className="px-3 py-2">{getString(r.supplier)}</td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2 font-semibold bg-black/5">ملاحظات</td>
                <td className="px-3 py-2 whitespace-pre-wrap">{getString(r.notes)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-bold">المرفقات</div>
        <div className="space-y-1 text-sm">
          {attachments.length ? (
            attachments.map((a, idx) => {
              const url = getString(a.url, "");
              const name = getString(a.name, "مرفق");
              return (
                <div key={url + idx} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>{name}</div>
                  {url ? <div className="text-black/60" dir="ltr">{url}</div> : <div>—</div>}
                </div>
              );
            })
          ) : (
            <div className="text-black/60">لا توجد مرفقات.</div>
          )}
        </div>
      </section>
    </div>
  );
}

