"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVehicleSchema } from "@/schemas/vehicle";
import { VehicleStatuses } from "@/constants/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Values = z.input<typeof createVehicleSchema>;
type Doc = NonNullable<Values["documents"]>[number];
type DocType = Doc["type"];

type DriverListItem = {
  _id: string;
  fullName: string;
  phone?: string;
  licenseCategory?: string;
  licenseExpiresAt?: string | Date;
};

export default function NewVehiclePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const form = useForm<Values>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      matricule: "",
      brand: "",
      model: "",
      trim: "",
      vehicleType: "",
      fuelType: "",
      color: "",
      year: undefined,
      odometerKm: 0,
      status: "available",
      imageUrl: "",
      notes: "",
      chassisNumber: "",
      serialNumber: "",
      ownerName: "",
      receiverName: "",
      receiverIdNumber: "",
      receiverMobile: "",
      licenseType: "",
      licenseExpiresAt: undefined,
      receivedAt: undefined,
      insuranceType: "",
      computerName: "",
      sectorLocation: "",
      carMode: "",
      documents: [],
    },
  });

  const imageUrl = form.watch("imageUrl");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      setDriversLoading(true);
      try {
        const res = await fetch("/api/drivers", { signal: controller.signal, cache: "no-store" });
        const json = (await res.json().catch(() => null)) as unknown;
        if (!mounted) return;
        const arr = Array.isArray(json) ? (json as Array<Record<string, unknown>>) : [];
        const mapped = arr
          .map((d) => ({
            _id: String(d._id ?? ""),
            fullName: String(d.fullName ?? ""),
            phone: typeof d.phone === "string" ? d.phone : undefined,
            licenseCategory: typeof d.licenseCategory === "string" ? d.licenseCategory : undefined,
            licenseExpiresAt: typeof d.licenseExpiresAt === "string" || d.licenseExpiresAt instanceof Date ? d.licenseExpiresAt : undefined,
          }))
          .filter((d) => d._id && d.fullName);
        setDrivers(mapped);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name !== "AbortError") setDrivers([]);
      } finally {
        if (mounted) setDriversLoading(false);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { url?: string }; message?: string } | null;
      if (!res.ok || !json?.ok || !json.data?.url) {
        throw new Error(json?.message ?? "Upload failed");
      }
      form.setValue("imageUrl", json.data.url, { shouldDirty: true, shouldValidate: true });
      toast("تم رفع الصورة بنجاح");
    } catch {
      toast("تعذر رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function uploadDoc(type: DocType, file: File) {
    setUploadingDocs((p) => ({ ...p, [String(type)]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { url?: string }; message?: string } | null;
      if (!res.ok || !json?.ok || !json.data?.url) throw new Error(json?.message ?? "Upload failed");

      const docs = (form.getValues("documents") ?? []).filter((d) => d.type !== type);
      docs.push({ type, fileUrl: json.data.url });
      form.setValue("documents", docs, { shouldDirty: true, shouldValidate: true });
      toast("تم رفع الملف بنجاح");
    } catch {
      toast("تعذر رفع الملف");
    } finally {
      setUploadingDocs((p) => ({ ...p, [String(type)]: false }));
    }
  }

  function docUrl(type: DocType) {
    const docs = form.getValues("documents") ?? [];
    return docs.find((d) => d.type === type)?.fileUrl ?? "";
  }

  async function onSubmit(values: Values) {
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      form.setError("matricule", { message: err?.message ?? "تعذر إنشاء السيارة" });
      return;
    }
    toast("تمت إضافة السيارة بنجاح");
    router.push("/fleet");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold">إضافة سيارة</h2>
        <p className="text-sm text-muted-foreground">أدخل بيانات السيارة الأساسية وحالتها الحالية.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-28 overflow-hidden rounded-2xl border bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="صورة السيارة"
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : null}
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              <Label>صورة السيارة</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f);
                  }}
                  disabled={uploading}
                />
                {imageUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setValue("imageUrl", "", { shouldDirty: true });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    إزالة
                  </Button>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">PNG/JPG/WEBP — حد أقصى 10MB.</div>
              {form.formState.errors.imageUrl ? (
                <div className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">بيانات السيارة</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="رقم اللوحة" error={form.formState.errors.matricule?.message}>
              <Input {...form.register("matricule")} placeholder="AL-16-123" />
            </Field>
            <Field label="وضع السيارة" error={form.formState.errors.carMode?.message}>
              <Input {...form.register("carMode")} placeholder="مثال: تشغيل / مخزون" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="الماركة" error={form.formState.errors.brand?.message}>
              <Input {...form.register("brand")} placeholder="Mercedes" />
            </Field>
            <Field label="الموديل" error={form.formState.errors.model?.message}>
              <Input {...form.register("model")} placeholder="Actros" />
            </Field>
            <Field label="الطراز" error={form.formState.errors.trim?.message}>
              <Input {...form.register("trim")} placeholder="مثال: 1845" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="نوع السيارة" error={form.formState.errors.vehicleType?.message}>
              <Input {...form.register("vehicleType")} placeholder="مثال: شاحنة" />
            </Field>
            <Field label="الوقود" error={form.formState.errors.fuelType?.message}>
              <Input {...form.register("fuelType")} placeholder="ديزل" />
            </Field>
            <Field label="اللون" error={form.formState.errors.color?.message}>
              <Input {...form.register("color")} placeholder="أبيض" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="السنة" error={form.formState.errors.year?.message}>
              <Input type="number" {...form.register("year")} placeholder="2021" />
            </Field>
            <Field label="الكيلومتراج الحالي" error={form.formState.errors.odometerKm?.message}>
              <Input type="number" {...form.register("odometerKm")} placeholder="0" />
            </Field>
            <Field label="الحالة" error={form.formState.errors.status?.message}>
              <select
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                {...form.register("status")}
              >
                {VehicleStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "available"
                      ? "متوفرة"
                      : s === "on_road"
                        ? "في الطريق"
                        : s === "maintenance"
                          ? "صيانة"
                          : "خارج الخدمة"}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="رقم الهيكل" error={form.formState.errors.chassisNumber?.message}>
              <Input dir="ltr" {...form.register("chassisNumber")} placeholder="VIN..." />
            </Field>
            <Field label="الرقم التسلسلي" error={form.formState.errors.serialNumber?.message}>
              <Input dir="ltr" {...form.register("serialNumber")} placeholder="Serial..." />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم المالك" error={form.formState.errors.ownerName?.message}>
              <Input {...form.register("ownerName")} />
            </Field>
            <Field label="الحاسب الآلي" error={form.formState.errors.computerName?.message}>
              <Input {...form.register("computerName")} placeholder="اسم/رمز الجهاز" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="القطاع والموقع" error={form.formState.errors.sectorLocation?.message}>
              <Input {...form.register("sectorLocation")} placeholder="القطاع — الموقع" />
            </Field>
            <Field label="ملاحظات" error={form.formState.errors.notes?.message}>
              <Input {...form.register("notes")} placeholder="ملاحظات إضافية" />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">بيانات المستلم</div>
          <div className="mt-4">
            <div className="space-y-2">
              <Label>اختيار سائق (مزامنة تلقائية)</Label>
              <select
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={selectedDriverId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedDriverId(id);
                  const d = drivers.find((x) => x._id === id);
                  if (!d) return;
                  form.setValue("receiverName", d.fullName, { shouldDirty: true, shouldValidate: true });
                  if (d.phone) form.setValue("receiverMobile", d.phone, { shouldDirty: true, shouldValidate: true });
                  if (d.licenseCategory) form.setValue("licenseType", d.licenseCategory, { shouldDirty: true, shouldValidate: true });
                  if (d.licenseExpiresAt) {
                    const dt = d.licenseExpiresAt instanceof Date ? d.licenseExpiresAt : new Date(d.licenseExpiresAt);
                    if (!Number.isNaN(dt.getTime())) {
                      form.setValue("licenseExpiresAt", dt, { shouldDirty: true, shouldValidate: true });
                    }
                  }
                }}
              >
                <option value="">{driversLoading ? "جاري التحميل..." : "بدون"}</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.fullName}
                    {d.phone ? ` — ${d.phone}` : ""}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">عند اختيار سائق: الاسم/الجوال/نوع الرخصة/صلاحيتها تتعبّى تلقائيًا.</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم المستلم" error={form.formState.errors.receiverName?.message}>
              <Input {...form.register("receiverName")} />
            </Field>
            <Field label="رقم الهوية" error={form.formState.errors.receiverIdNumber?.message}>
              <Input dir="ltr" {...form.register("receiverIdNumber")} />
            </Field>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="رقم الجوال" error={form.formState.errors.receiverMobile?.message}>
              <Input dir="ltr" {...form.register("receiverMobile")} placeholder="+966..." />
            </Field>
            <Field
              label="تاريخ الاستلام"
              error={typeof form.formState.errors.receivedAt?.message === "string" ? form.formState.errors.receivedAt.message : undefined}
            >
              <Input
                type="date"
                dir="ltr"
                onChange={(e) => form.setValue("receivedAt", e.target.value ? new Date(e.target.value) : undefined)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">الرخص والتأمين</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نوع الرخصة" error={form.formState.errors.licenseType?.message}>
              <Input {...form.register("licenseType")} placeholder="مثال: نقل ثقيل" />
            </Field>
            <Field
              label="صلاحية الرخصة"
              error={
                typeof form.formState.errors.licenseExpiresAt?.message === "string"
                  ? form.formState.errors.licenseExpiresAt.message
                  : undefined
              }
            >
              <Input
                type="date"
                dir="ltr"
                onChange={(e) => form.setValue("licenseExpiresAt", e.target.value ? new Date(e.target.value) : undefined)}
              />
            </Field>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نوع التأمين" error={form.formState.errors.insuranceType?.message}>
              <Input {...form.register("insuranceType")} placeholder="شامل / ضد الغير" />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">الوثائق (رفع ملفات)</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DocUpload
              label="الاستمارة"
              hint="PDF/صورة"
              busy={!!uploadingDocs.form}
              url={docUrl("form")}
              onPick={(f) => uploadDoc("form", f)}
            />
            <DocUpload
              label="التأمين"
              hint="PDF/صورة"
              busy={!!uploadingDocs.insurance}
              url={docUrl("insurance")}
              onPick={(f) => uploadDoc("insurance", f)}
            />
            <DocUpload
              label="الفحص الدوري"
              hint="PDF/صورة"
              busy={!!uploadingDocs.technical_inspection}
              url={docUrl("technical_inspection")}
              onPick={(f) => uploadDoc("technical_inspection", f)}
            />
            <DocUpload
              label="كرت التشغيل"
              hint="PDF/صورة"
              busy={!!uploadingDocs.operation_card}
              url={docUrl("operation_card")}
              onPick={(f) => uploadDoc("operation_card", f)}
            />
            <DocUpload
              label="التفويض"
              hint="PDF/صورة"
              busy={!!uploadingDocs.delegation}
              url={docUrl("delegation")}
              onPick={(f) => uploadDoc("delegation", f)}
            />
            <DocUpload
              label="البطاقة المهنية"
              hint="PDF/صورة"
              busy={!!uploadingDocs.professional_card}
              url={docUrl("professional_card")}
              onPick={(f) => uploadDoc("professional_card", f)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            حفظ السيارة
          </Button>
        </div>
      </form>
    </div>
  );
}

function DocUpload({
  label,
  hint,
  url,
  busy,
  onPick,
}: {
  label: string;
  hint: string;
  url: string;
  busy: boolean;
  onPick: (f: File) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      <div className="text-xs text-muted-foreground">{hint}</div>
      {url ? (
        <a className="text-xs font-semibold underline" href={url} target="_blank" rel="noreferrer">
          عرض الملف
        </a>
      ) : null}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <div className="text-xs text-destructive">{error}</div> : null}
    </div>
  );
}

