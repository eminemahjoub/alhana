import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";
import { PrintClientActions } from "./print-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown, fallback = "—") {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function getDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default async function VehiclePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();

  const vehicle = await Vehicle.findById(id).lean();
  if (!vehicle) return notFound();

  const v = vehicle as unknown as Record<string, unknown>;
  const matricule = getString(v.matricule, "");

  const receivedAt = getDate(v.receivedAt)?.toLocaleDateString("ar-SA") ?? "—";
  const licenseExpiresAt = getDate(v.licenseExpiresAt)?.toLocaleDateString("ar-SA") ?? "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-white p-6 text-black">
      <style>{`
        @media print {
          body { background: white !important; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      <PrintClientActions />

      <div className="print:hidden">
        <Link href={`/fleet/${id}`} className="text-sm underline">
          رجوع للتفاصيل
        </Link>
      </div>

      <header className="space-y-2 border-b pb-4">
        <div className="text-2xl font-extrabold">{matricule || "تفاصيل السيارة"}</div>
        <div className="text-sm text-black/70">
          {getString(v.brand, "")} {getString(v.model, "")} {typeof v.year === "number" ? `• ${v.year}` : ""}
        </div>
      </header>

      <section className="space-y-3">
        <div className="text-sm font-bold">معلومات السيارة</div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <tbody>
              <Row label="نوع السيارة" value={getString(v.vehicleType)} />
              <Row label="الطراز" value={getString(v.trim)} />
              <Row label="الوقود" value={getString(v.fuelType)} />
              <Row label="اللون" value={getString(v.color)} />
              <Row label="رقم الهيكل" value={getString(v.chassisNumber)} ltr />
              <Row label="الرقم التسلسلي" value={getString(v.serialNumber)} ltr />
              <Row label="القطاع والموقع" value={getString(v.sectorLocation)} />
              <Row label="وضع السيارة" value={getString(v.carMode)} />
              <Row label="اسم المالك" value={getString(v.ownerName)} />
              <Row label="الحاسب الآلي" value={getString(v.computerName)} />
              <Row label="نوع الرخصة" value={getString(v.licenseType)} />
              <Row label="انتهاء الرخصة" value={licenseExpiresAt} />
              <Row label="تاريخ الاستلام" value={receivedAt} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-sm font-bold">بيانات المستلم</div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <tbody>
              <Row label="اسم المستلم" value={getString(v.receiverName)} />
              <Row label="رقم الهوية" value={getString(v.receiverIdNumber)} ltr />
              <Row label="رقم الجوال" value={getString(v.receiverMobile)} ltr />
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-bold">الوثائق</div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-black/5">
              <tr>
                <th className="px-3 py-2 text-right font-semibold">النوع</th>
                <th className="px-3 py-2 text-right font-semibold">الرقم</th>
                <th className="px-3 py-2 text-right font-semibold">الانتهاء</th>
                <th className="px-3 py-2 text-right font-semibold">ملف</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const docs = v.documents;
                const arr = Array.isArray(docs) ? docs : [];
                const rows = arr.map((raw) => (isRecord(raw) ? raw : {}));
                return rows.length ? (
                  rows.map((d, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{getString(d.type)}</td>
                      <td className="px-3 py-2">{getString(d.number)}</td>
                      <td className="px-3 py-2">{getDate(d.expiresAt)?.toLocaleDateString("ar-SA") ?? "—"}</td>
                      <td className="px-3 py-2" dir="ltr">
                        {getString(d.fileUrl, "") || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="px-3 py-6 text-center text-black/60" colSpan={4}>
                      لا توجد وثائق.
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <tr className="border-t">
      <td className="px-3 py-2 font-semibold bg-black/5 w-48">{label}</td>
      <td className="px-3 py-2" dir={ltr ? "ltr" : "rtl"} colSpan={3}>
        {value}
      </td>
    </tr>
  );
}

