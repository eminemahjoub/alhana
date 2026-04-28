"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDriverSchema } from "@/schemas/driver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Values = z.input<typeof createDriverSchema>;

export default function NewDriverPage() {
  const router = useRouter();
  const iqamaRef = useRef<HTMLInputElement | null>(null);
  const [uploadingIqama, setUploadingIqama] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      idNumber: "",
      iqamaImageUrl: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiresAt: undefined,
    },
  });

  const iqamaUrl = form.watch("iqamaImageUrl");

  async function uploadIqama(file: File) {
    setUploadingIqama(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { url?: string }; message?: string } | null;
      if (!res.ok || !json?.ok || !json.data?.url) throw new Error(json?.message ?? "Upload failed");
      form.setValue("iqamaImageUrl", json.data.url, { shouldDirty: true, shouldValidate: true });
      toast("تم رفع الإقامة بنجاح");
    } catch {
      toast("تعذر رفع الإقامة");
    } finally {
      setUploadingIqama(false);
    }
  }

  async function onSubmit(values: Values) {
    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      form.setError("fullName", { message: err?.message ?? "تعذر إنشاء السائق" });
      return;
    }
    toast("تمت إضافة السائق بنجاح");
    router.push("/drivers");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold">إضافة سائق</h2>
        <p className="text-sm text-muted-foreground">أدخل بيانات السائق والهوية والإقامة والرخصة.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <Field label="اسم السائق" error={form.formState.errors.fullName?.message}>
          <Input {...form.register("fullName")} placeholder="أحمد بن يوسف" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الهاتف" error={form.formState.errors.phone?.message}>
            <Input dir="ltr" {...form.register("phone")} placeholder="+213..." />
          </Field>
          <Field label="رقم الهوية" error={form.formState.errors.idNumber?.message}>
            <Input dir="ltr" {...form.register("idNumber")} placeholder="ID / Iqama No" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الرخصة" error={form.formState.errors.licenseNumber?.message}>
            <Input dir="ltr" {...form.register("licenseNumber")} placeholder="DL-AL-1001" />
          </Field>
          <Field label="فئة الرخصة" error={form.formState.errors.licenseCategory?.message}>
            <Input {...form.register("licenseCategory")} placeholder="C / C+E" />
          </Field>
        </div>

        <Field
          label="صلاحية الرخصة"
          error={typeof form.formState.errors.licenseExpiresAt?.message === "string" ? form.formState.errors.licenseExpiresAt.message : undefined}
        >
          <Input
            type="date"
            dir="ltr"
            onChange={(e) => form.setValue("licenseExpiresAt", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </Field>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">الإقامة (رفع ملف)</div>
          <div className="mt-3 space-y-2">
            <Label>ملف الإقامة</Label>
            <input
              ref={iqamaRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
              disabled={uploadingIqama}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadIqama(f);
              }}
            />
            <div className="text-xs text-muted-foreground">PDF/PNG/JPG/WEBP — حد أقصى 10MB.</div>
            {iqamaUrl ? (
              <div className="flex items-center justify-between">
                <a className="text-xs font-semibold underline" href={iqamaUrl} target="_blank" rel="noreferrer">
                  عرض الملف
                </a>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue("iqamaImageUrl", "", { shouldDirty: true });
                    if (iqamaRef.current) iqamaRef.current.value = "";
                  }}
                >
                  إزالة
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            حفظ السائق
          </Button>
        </div>
      </form>
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

