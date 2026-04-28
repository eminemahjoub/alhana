"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDriverSchema } from "@/schemas/driver";
import { DriverStatuses } from "@/constants/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Values = z.input<typeof createDriverSchema>;

export default function NewDriverPage() {
  const router = useRouter();
  const form = useForm<Values>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      licenseNumber: "",
      licenseCategory: "",
      status: "active",
      isAvailable: true,
    },
  });

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
        <p className="text-sm text-muted-foreground">أدخل بيانات السائق والرخصة والحالة.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <Field label="اسم السائق" error={form.formState.errors.fullName?.message}>
          <Input {...form.register("fullName")} placeholder="أحمد بن يوسف" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الهاتف" error={form.formState.errors.phone?.message}>
            <Input dir="ltr" {...form.register("phone")} placeholder="+213..." />
          </Field>
          <Field label="التوفر" error={form.formState.errors.isAvailable?.message}>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              {...form.register("isAvailable")}
            >
              <option value="true">متوفر</option>
              <option value="false">غير متوفر</option>
            </select>
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

        <Field label="الحالة" error={form.formState.errors.status?.message}>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            {...form.register("status")}
          >
            {DriverStatuses.map((s) => (
              <option key={s} value={s}>
                {s === "active" ? "نشط" : s === "inactive" ? "غير نشط" : "موقوف"}
              </option>
            ))}
          </select>
        </Field>

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

