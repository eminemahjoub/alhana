"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaintenanceTypes } from "@/constants/enums";
import { createMaintenanceSchema } from "@/schemas/maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Values = z.input<typeof createMaintenanceSchema>;

type VehicleHit = { _id: string; matricule: string; brand?: string; model?: string };

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; message?: string; details?: unknown };
type JsonResponse<T> = JsonOk<T> | JsonErr;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export default function NewMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = React.useState<VehicleHit[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      vehicleId: "",
      type: "other",
      title: "",
      performedAt: new Date(),
      odometerKm: undefined,
      costSar: 0,
      supplier: "",
      notes: "",
      attachments: [],
    },
  });

  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      setVehiclesLoading(true);
      try {
        const res = await fetch("/api/vehicles", { signal: controller.signal, cache: "no-store" });
        const json = (await res.json().catch(() => null)) as unknown;
        if (!mounted) return;
        const data = (() => {
          if (isRecord(json) && "ok" in json) {
            const r = json as JsonResponse<unknown>;
            if (r.ok && Array.isArray((r as JsonOk<unknown>).data)) return (r as JsonOk<unknown[]>).data;
            return [];
          }
          return Array.isArray(json) ? json : [];
        })();
        const mapped = data
          .map((raw) => {
            const v = isRecord(raw) ? raw : {};
            const _id = String(v._id ?? "");
            const matricule = String(v.matricule ?? "");
            return {
              _id,
              matricule,
              brand: typeof v.brand === "string" ? v.brand : undefined,
              model: typeof v.model === "string" ? v.model : undefined,
            } satisfies VehicleHit;
          })
          .filter((v) => v._id && v.matricule);
        setVehicles(mapped);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name !== "AbortError") setVehicles([]);
      } finally {
        if (mounted) setVehiclesLoading(false);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const current = form.getValues("attachments") ?? [];
      const next = [...current];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { url?: string }; message?: string } | null;
        if (!res.ok || !json?.ok || !json.data?.url) throw new Error(json?.message ?? "Upload failed");
        next.push({ url: json.data.url, name: f.name, mime: f.type });
      }
      form.setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
      toast("تم رفع المرفقات");
    } catch {
      toast("تعذر رفع المرفقات");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: Values) {
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      form.setError("vehicleId", { message: err?.message ?? "تعذر إنشاء التقرير" });
      return;
    }
    toast("تمت إضافة التقرير بنجاح");
    router.push("/maintenance");
    router.refresh();
  }

  const atts = form.watch("attachments") ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold">إضافة تقرير صيانة/ميكانيك</h2>
        <p className="text-sm text-muted-foreground">سجّل تبديل زيت، تقرير ميكانيك، أو تصليح مع مرفقات.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>السيارة</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              {...form.register("vehicleId")}
            >
              <option value="">{vehiclesLoading ? "جاري التحميل..." : "اختر سيارة"}</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.matricule} — {v.brand ?? ""} {v.model ?? ""}
                </option>
              ))}
            </select>
            {form.formState.errors.vehicleId?.message ? (
              <div className="text-xs text-destructive">{form.formState.errors.vehicleId.message}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>نوع التقرير</Label>
            <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...form.register("type")}>
              {MaintenanceTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "oil_change"
                    ? "تبديل زيت"
                    : t === "inspection"
                      ? "فحص"
                      : t === "repair"
                        ? "تصليح"
                        : t === "tires"
                          ? "إطارات"
                          : t === "brakes"
                            ? "فرامل"
                            : "تقرير/أخرى"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input {...form.register("title")} placeholder="مثال: تقرير ميكانيك - ملاحظة اهتزاز" />
          </div>
          <div className="space-y-2">
            <Label>تاريخ التنفيذ</Label>
            <Input
              type="date"
              dir="ltr"
              onChange={(e) => form.setValue("performedAt", e.target.value ? new Date(e.target.value) : new Date())}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>الكيلومتراج</Label>
            <Input type="number" {...form.register("odometerKm")} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>التكلفة (SAR)</Label>
            <Input type="number" {...form.register("costSar")} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>الورشة/المورّد</Label>
            <Input {...form.register("supplier")} placeholder="اسم الورشة" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>ملاحظات</Label>
          <Input {...form.register("notes")} placeholder="تفاصيل التقرير..." />
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">مرفقات</div>
          <div className="mt-3 space-y-2">
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files) void uploadFiles(e.target.files);
              }}
            />
            {atts.length ? (
              <div className="space-y-1">
                {atts.map((a, idx) => (
                  <div key={a.url + idx} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-sm">
                    <a className="font-semibold underline" href={a.url} target="_blank" rel="noreferrer">
                      {a.name ?? "مرفق"}
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const next = (form.getValues("attachments") ?? []).filter((_, i) => i !== idx);
                        form.setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      إزالة
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">ارفع PDF/صور للفواتير أو تقرير الميكانيك.</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            حفظ التقرير
          </Button>
        </div>
      </form>
    </div>
  );
}

