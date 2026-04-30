import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";
import { Driver } from "@/models/Driver";
import { Maintenance } from "@/models/Maintenance";
import { VehicleAssignment } from "@/models/VehicleAssignment";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Badge } from "@/components/ui/badge";
import { AssignDriver } from "./assign-driver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PopulatedDriver = {
  fullName?: string;
  phone?: string;
};

type AssignmentRow = {
  _id: unknown;
  assignedAt?: Date;
  unassignedAt?: Date | null;
  driverId?: unknown;
};

type MaintenanceRow = {
  _id: unknown;
  type?: string;
  title?: string;
  performedAt?: Date;
  odometerKm?: number;
};

type PurchaseRow = {
  _id: unknown;
  title?: string;
  status?: string;
  createdAt?: Date;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown, fallback = "—") {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function getDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function statusLabel(status: string) {
  switch (status) {
    case "available":
      return { label: "متوفرة", variant: "success" as const };
    case "on_road":
      return { label: "في الطريق", variant: "info" as const };
    case "maintenance":
      return { label: "صيانة", variant: "warning" as const };
    case "out_of_service":
      return { label: "خارج الخدمة", variant: "danger" as const };
    default:
      return { label: status, variant: "default" as const };
  }
}

export default async function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();

  const vehicle = await Vehicle.findById(id).lean();
  if (!vehicle) return notFound();

  // Ensure model is registered for populate
  void Driver;

  const currentAssignment = await VehicleAssignment.findOne({
    vehicleId: id,
    $or: [{ unassignedAt: null }, { unassignedAt: { $exists: false } }],
  })
    .sort({ assignedAt: -1 })
    .populate("driverId")
    .lean();

  const assignments = await VehicleAssignment.find({ vehicleId: id })
    .sort({ assignedAt: -1 })
    .limit(50)
    .populate("driverId")
    .lean();

  const maintenance = await Maintenance.find({ vehicleId: id })
    .sort({ performedAt: -1 })
    .limit(50)
    .lean();

  const purchases = await PurchaseRequest.find({ vehicleId: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("_id title status createdAt")
    .lean();

  const s = statusLabel(String(vehicle.status ?? ""));
  const imageUrl = typeof vehicle.imageUrl === "string" ? vehicle.imageUrl : "";
  const matricule = String(vehicle.matricule ?? "");

  const currentDriver = (() => {
    if (!currentAssignment) return null;
    const a = currentAssignment as unknown as AssignmentRow;
    const d = a.driverId;
    return isRecord(d) ? (d as PopulatedDriver) : null;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border bg-muted">
            {imageUrl ? (
              <Image src={imageUrl} alt={matricule} fill className="object-cover" sizes="48px" />
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">{matricule}</h2>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {String(vehicle.brand ?? "")} {String(vehicle.model ?? "")}
              {vehicle.year ? ` • ${vehicle.year}` : ""}
              {typeof vehicle.odometerKm === "number" ? ` • ${vehicle.odometerKm.toLocaleString("fr-DZ")} كم` : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/fleet" className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold hover:bg-muted">
            رجوع للأسطول
          </Link>
          <Link
            href={`/fleet/${encodeURIComponent(String(vehicle._id))}/print`}
            className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold hover:bg-muted"
          >
            طباعة / PDF
          </Link>
          <Link href="/maintenance" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95">
            الصيانة
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">معلومات السيارة</div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info label="نوع السيارة" value={getString((vehicle as unknown as Record<string, unknown>).vehicleType)} />
              <Info label="الطراز" value={getString((vehicle as unknown as Record<string, unknown>).trim)} />
              <Info label="الوقود" value={getString((vehicle as unknown as Record<string, unknown>).fuelType)} />
              <Info label="اللون" value={String(vehicle.color ?? "—")} />
              <Info label="رقم الهيكل" value={getString((vehicle as unknown as Record<string, unknown>).chassisNumber)} ltr />
              <Info label="الرقم التسلسلي" value={getString((vehicle as unknown as Record<string, unknown>).serialNumber)} ltr />
              <Info label="وضع السيارة" value={getString((vehicle as unknown as Record<string, unknown>).carMode)} />
              <Info label="القطاع والموقع" value={getString((vehicle as unknown as Record<string, unknown>).sectorLocation)} />
              <Info label="اسم المالك" value={getString((vehicle as unknown as Record<string, unknown>).ownerName)} />
              <Info label="الحاسب الآلي" value={getString((vehicle as unknown as Record<string, unknown>).computerName)} />
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">بيانات المستلم</div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info label="اسم المستلم" value={getString((vehicle as unknown as Record<string, unknown>).receiverName)} />
              <Info label="رقم الهوية" value={getString((vehicle as unknown as Record<string, unknown>).receiverIdNumber)} ltr />
              <Info label="رقم الجوال" value={getString((vehicle as unknown as Record<string, unknown>).receiverMobile)} ltr />
              <Info
                label="تاريخ الاستلام"
                value={
                  (() => {
                    const d = getDate((vehicle as unknown as Record<string, unknown>).receivedAt);
                    return d ? d.toLocaleDateString("ar-SA") : "—";
                  })()
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">الوثائق</div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(() => {
                const docs = (vehicle as unknown as Record<string, unknown>).documents;
                return Array.isArray(docs) ? docs : [];
              })().length ? (
                ((vehicle as unknown as Record<string, unknown>).documents as unknown[]).map((raw, idx: number) => {
                  const d = isRecord(raw) ? raw : {};
                  const fileUrl = typeof d.fileUrl === "string" ? d.fileUrl : "";
                  const type = getString(d.type, "—");
                  return (
                  <div key={idx} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-sm">
                    <div className="text-muted-foreground">{type}</div>
                    {fileUrl ? (
                      <a className="font-semibold underline" href={fileUrl} target="_blank" rel="noreferrer">
                        عرض
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد وثائق.</div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">السائق الحالي</div>
            <div className="mt-3">
              {currentDriver ? (
                <div className="space-y-1">
                  <div className="font-semibold">{String(currentDriver.fullName ?? "—")}</div>
                  <div className="text-sm text-muted-foreground" dir="ltr">
                    {String(currentDriver.phone ?? "—")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(() => {
                      const a = currentAssignment as unknown as AssignmentRow;
                      const d = getDate(a.assignedAt);
                      return d ? `مُعيّن منذ: ${d.toLocaleDateString("ar-SA")}` : "";
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">لا يوجد سائق مُعيّن حاليًا.</div>
              )}
            </div>
          </div>

          <AssignDriver
            vehicleId={String(vehicle._id)}
          />

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">تاريخ السائقين</div>
            <div className="mt-3 space-y-2">
              {assignments.length ? (
                (assignments as unknown as AssignmentRow[]).map((a) => {
                  const d = isRecord(a.driverId) ? (a.driverId as PopulatedDriver) : null;
                  const from = getDate(a.assignedAt)?.toLocaleDateString("ar-SA") ?? "—";
                  const to = getDate(a.unassignedAt)?.toLocaleDateString("ar-SA") ?? "حتى الآن";
                  return (
                    <div key={String(a._id)} className="rounded-xl border bg-card/40 px-3 py-2">
                      <div className="text-sm font-semibold">{d ? getString(d.fullName) : "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {from} → {to}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا يوجد تاريخ تعيين.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">تاريخ الصيانة</div>
            <div className="mt-3 space-y-2">
              {maintenance.length ? (
                (maintenance as unknown as MaintenanceRow[]).map((m) => {
                  const title = getString(m.title) !== "—" ? getString(m.title) : getString(m.type, "صيانة");
                  const performed = getDate(m.performedAt)?.toLocaleDateString("ar-SA") ?? "—";
                  const km = getNumber(m.odometerKm);
                  return (
                    <Link key={String(m._id)} href={`/maintenance/${String(m._id)}`} className="block rounded-xl border bg-card/40 px-3 py-2 hover:bg-muted/30">
                      <div className="text-sm font-semibold underline-offset-4 hover:underline">{title}</div>
                      <div className="text-xs text-muted-foreground">
                        {performed}
                        {km !== null ? ` • ${km.toLocaleString("fr-DZ")} كم` : ""}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا يوجد سجل صيانة بعد.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold">طلبات المشتريات</div>
              <Link
                href={`/purchases/new?vehicleId=${encodeURIComponent(String(vehicle._id))}`}
                className="text-xs font-semibold underline-offset-4 hover:underline"
              >
                طلب جديد
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {purchases.length ? (
                (purchases as unknown as PurchaseRow[]).map((p) => {
                  const title = getString(p.title, "طلب مشتريات");
                  const when = getDate(p.createdAt)?.toLocaleDateString("ar-SA") ?? "—";
                  return (
                    <Link key={String(p._id)} href={`/purchases/${String(p._id)}`} className="block rounded-xl border bg-card/40 px-3 py-2 hover:bg-muted/30">
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-muted-foreground">{when}</div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد طلبات بعد.</div>
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

