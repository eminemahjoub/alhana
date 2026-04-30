import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Maintenance } from "@/models/Maintenance";
import { Vehicle } from "@/models/Vehicle";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VehicleRef = { _id?: unknown; matricule?: string; brand?: string; model?: string };

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

function typeLabel(t: string) {
  switch (t) {
    case "oil_change":
      return { label: "تبديل زيت", variant: "info" as const };
    case "inspection":
      return { label: "فحص", variant: "default" as const };
    case "repair":
      return { label: "تصليح", variant: "warning" as const };
    case "tires":
      return { label: "إطارات", variant: "default" as const };
    case "brakes":
      return { label: "فرامل", variant: "default" as const };
    case "other":
      return { label: "تقرير ميكانيك", variant: "success" as const };
    default:
      return { label: t, variant: "default" as const };
  }
}

export default async function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();
  void Vehicle;

  const row = await Maintenance.findById(id).populate("vehicleId", "matricule brand model").lean();
  if (!row) return notFound();

  const r = row as unknown as Record<string, unknown>;
  const vehicle = isRecord(r.vehicleId) ? (r.vehicleId as VehicleRef) : null;
  const performedAt = getDate(r.performedAt);
  const type = getString(r.type, "");
  const t = typeLabel(type);

  const attachments = (() => {
    const raw = r.attachments;
    return Array.isArray(raw) ? raw.filter(isRecord) : [];
  })();

  const purchases = await PurchaseRequest.find({ maintenanceId: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("_id title status createdAt")
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">{getString(r.title, "تفاصيل الصيانة")}</h2>
            {type ? <Badge variant={t.variant}>{t.label}</Badge> : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {performedAt ? performedAt.toLocaleDateString("ar-SA") : "—"}
            {vehicle?.matricule ? (
              <>
                {" "}
                •{" "}
                <Link href={`/fleet/${String(vehicle._id ?? "")}`} className="font-semibold underline-offset-4 hover:underline">
                  {getString(vehicle.matricule)}
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/maintenance" className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold hover:bg-muted">
            رجوع
          </Link>
          <Link
            href={`/maintenance/${id}/print`}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
          >
            طباعة / PDF
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">تفاصيل</div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info label="السيارة" value={vehicle?.matricule ? getString(vehicle.matricule) : "—"} />
              <Info label="التاريخ" value={performedAt ? performedAt.toLocaleDateString("ar-SA") : "—"} />
              <Info label="الكيلومتراج" value={(() => {
                const km = getNumber(r.odometerKm);
                return km === null ? "—" : `${km.toLocaleString("fr-DZ")} كم`;
              })()} ltr />
              <Info label="التكلفة" value={(() => {
                const c = getNumber(r.costSar);
                return c === null ? "—" : `${c.toLocaleString("ar-SA")} SAR`;
              })()} ltr />
              <Info label="المورّد" value={getString(r.supplier)} />
              <Info label="الصيانة الدورية القادمة" value={(() => {
                const nextAt = getDate(r.nextDueAt);
                const nextKm = getNumber(r.nextDueKm);
                const parts = [
                  nextAt ? nextAt.toLocaleDateString("ar-SA") : "",
                  nextKm === null ? "" : `${nextKm.toLocaleString("fr-DZ")} كم`,
                ].filter(Boolean);
                return parts.length ? parts.join(" • ") : "—";
              })()} />
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold text-muted-foreground">ملاحظات</div>
              <div className="mt-1 rounded-xl border bg-card/40 px-3 py-2 text-sm font-semibold">{getString(r.notes)}</div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">مرفقات</div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {attachments.length ? (
                attachments.map((a, idx) => {
                  const url = getString(a.url, "");
                  const name = getString(a.name, "مرفق");
                  return (
                    <div key={url + idx} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-sm">
                      <div className="text-muted-foreground">{name}</div>
                      {url ? (
                        <a className="font-semibold underline" href={url} target="_blank" rel="noreferrer">
                          عرض
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد مرفقات.</div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">طلبات مشتريات مرتبطة</div>
            <div className="mt-3 space-y-2">
              {purchases.length ? (
                purchases.map((p) => (
                  <Link
                    key={String((p as unknown as Record<string, unknown>)._id)}
                    href={`/purchases/${String((p as unknown as Record<string, unknown>)._id)}`}
                    className="block rounded-xl border bg-card/40 px-3 py-2 hover:bg-muted/30"
                  >
                    <div className="text-sm font-semibold">{getString((p as unknown as Record<string, unknown>).title, "طلب مشتريات")}</div>
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const d = getDate((p as unknown as Record<string, unknown>).createdAt);
                        return d ? d.toLocaleDateString("ar-SA") : "—";
                      })()}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد طلبات.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl border bg-card/40 px-3 py-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold" dir={ltr ? "ltr" : "rtl"}>
        {value}
      </div>
    </div>
  );
}

