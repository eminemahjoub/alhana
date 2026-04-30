import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { PurchaseRequest } from "@/models/PurchaseRequest";
import { Vehicle } from "@/models/Vehicle";
import { Badge } from "@/components/ui/badge";
import { PurchaseWorkflowActions } from "./workflow-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VehicleRef = { matricule?: string };
type PurchaseItem = { name?: string; qty?: number; unitPriceSar?: number; totalSar?: number };
type PurchaseRow = {
  _id?: unknown;
  status?: unknown;
  title?: unknown;
  supplier?: unknown;
  notes?: unknown;
  items?: unknown;
  vehicleId?: unknown;
};

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

function statusLabel(s: string) {
  switch (s) {
    case "draft":
      return { label: "مسودة", variant: "default" as const };
    case "submitted":
      return { label: "مُرسل", variant: "info" as const };
    case "approved":
      return { label: "موافق", variant: "success" as const };
    case "ordered":
      return { label: "تم الطلب", variant: "default" as const };
    case "received":
      return { label: "تم الاستلام", variant: "success" as const };
    case "invoiced":
      return { label: "فاتورة", variant: "warning" as const };
    case "paid":
      return { label: "مدفوع", variant: "success" as const };
    case "cancelled":
      return { label: "ملغي", variant: "danger" as const };
    default:
      return { label: s, variant: "default" as const };
  }
}

export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  await dbConnect();
  void Vehicle;

  const row = await PurchaseRequest.findById(id).populate("vehicleId", "matricule brand model").lean();
  if (!row) return notFound();

  const r = (row as unknown) as PurchaseRow;
  const status = getString(r.status, "");
  const s = statusLabel(status);
  const title = getString(r.title, "طلب مشتريات");
  const supplier = getString(r.supplier);
  const notes = getString(r.notes);
  const vehicle = isRecord(r.vehicleId) ? ((r.vehicleId as unknown) as VehicleRef) : null;
  const vehicleMatricule = vehicle ? getString(vehicle.matricule, "") : "";

  const itemsRaw = r.items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => (isRecord(it) ? (it as PurchaseItem) : ({} as PurchaseItem)))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {supplier !== "—" ? `المورّد: ${supplier}` : "—"}
            {vehicleMatricule ? ` • سيارة: ${vehicleMatricule}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/purchases" className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold hover:bg-muted">
            رجوع
          </Link>
          <Link
            href={`/purchases/${String(r._id ?? "")}/print`}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:opacity-95"
          >
            طباعة / PDF
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">بنود الطلب</div>
          <div className="mt-3 space-y-2">
            {items.length ? (
              items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-sm">
                  <div className="font-semibold">{getString(it.name)}</div>
                  <div className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                    {getNumber(it.qty)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد بنود.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">معلومات</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الحالة</span>
              <span className="font-semibold">{s.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المورّد</span>
              <span className="font-semibold">{supplier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ملاحظات</span>
              <span className="font-semibold">{notes}</span>
            </div>
          </div>
        </div>
      </div>

      <PurchaseWorkflowActions id={String(r._id ?? "")} status={status} />
    </div>
  );
}

