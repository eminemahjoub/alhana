"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTransportOrderSchema } from "@/schemas/order";
import { TransportOrderStatuses } from "@/constants/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Values = z.infer<typeof createTransportOrderSchema>;

type Option = { value: string; label: string };

export default function NewOrderPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Option[]>([]);
  const [vehicles, setVehicles] = useState<Option[]>([]);
  const [drivers, setDrivers] = useState<Option[]>([]);

  const defaultOrderNo = useMemo(() => {
    const y = new Date().getFullYear();
    const rnd = Math.floor(Math.random() * 9000) + 1000;
    return `ORD-${y}-${rnd}`;
  }, []);

  const form = useForm<Values>({
    resolver: zodResolver(createTransportOrderSchema) as unknown as Resolver<Values>,
    defaultValues: {
      orderNo: defaultOrderNo,
      clientId: "",
      pickup: { addressLine: "", city: "" },
      delivery: { addressLine: "", city: "" },
      cargoType: "",
      weightKg: 0,
      scheduledAt: new Date(),
      status: "new",
      revenueDzd: 0,
      costDzd: 0,
    },
  });

  useEffect(() => {
    async function load() {
      const [c, v, d] = await Promise.all([
        fetch("/api/clients").then((r) => r.json()),
        fetch("/api/vehicles").then((r) => r.json()),
        fetch("/api/drivers").then((r) => r.json()),
      ]);

      setClients(
        ((c?.data ?? []) as Array<Record<string, unknown>>).map((x) => ({
          value: String(x._id),
          label: String(x.name),
        }))
      );
      setVehicles(
        ((v?.data ?? []) as Array<Record<string, unknown>>).map((x) => ({
          value: String(x._id),
          label: `${String(x.matricule)} — ${String(x.brand)} ${String(x.model)}`,
        }))
      );
      setDrivers(
        ((d?.data ?? []) as Array<Record<string, unknown>>).map((x) => ({
          value: String(x._id),
          label: `${String(x.fullName)} — ${String(x.phone ?? "")}`.trim(),
        }))
      );
    }
    void load();
  }, []);

  async function onSubmit(values: Values) {
    const payload = {
      ...values,
      scheduledAt: values.scheduledAt.toISOString(),
    } as Omit<Values, "scheduledAt"> & { scheduledAt: string };
    if (!payload.vehicleId) delete payload.vehicleId;
    if (!payload.driverId) delete payload.driverId;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      form.setError("orderNo", { message: err?.message ?? "تعذر إنشاء الطلب" });
      return;
    }
    toast("تم إنشاء طلب النقل بنجاح");
    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold">إنشاء طلب نقل جديد</h2>
        <p className="text-sm text-muted-foreground">
          عميل + تحميل/تفريغ + بضاعة + وزن + موعد + تعيين سائق/سيارة + حالة.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الطلب" error={form.formState.errors.orderNo?.message}>
            <Input dir="ltr" {...form.register("orderNo")} />
          </Field>
          <Field label="الحالة" error={form.formState.errors.status?.message}>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              {...form.register("status")}
            >
              {TransportOrderStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === "new"
                    ? "جديد"
                    : s === "approved"
                      ? "معتمد"
                      : s === "on_road"
                        ? "في الطريق"
                        : s === "delivered"
                          ? "مُسلم"
                          : "ملغي"}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="العميل" error={form.formState.errors.clientId?.message}>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            {...form.register("clientId")}
          >
            <option value="">اختر عميل...</option>
            {clients.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="عنوان التحميل" error={form.formState.errors.pickup?.addressLine?.message}>
            <Input {...form.register("pickup.addressLine")} placeholder="مثال: الرويبة — مستودع A" />
          </Field>
          <Field label="مدينة التحميل" error={form.formState.errors.pickup?.city?.message}>
            <Input {...form.register("pickup.city")} placeholder="الجزائر" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="عنوان التفريغ" error={form.formState.errors.delivery?.addressLine?.message}>
            <Input {...form.register("delivery.addressLine")} placeholder="مثال: زرالدة — مخزن 3" />
          </Field>
          <Field label="مدينة التفريغ" error={form.formState.errors.delivery?.city?.message}>
            <Input {...form.register("delivery.city")} placeholder="الجزائر" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="نوع البضاعة" error={form.formState.errors.cargoType?.message}>
            <Input {...form.register("cargoType")} placeholder="مواد بناء" />
          </Field>
          <Field label="الوزن (كغ)" error={form.formState.errors.weightKg?.message}>
            <Input type="number" {...form.register("weightKg")} />
          </Field>
          <Field
            label="الموعد"
            error={
              form.formState.errors.scheduledAt?.message
                ? String(form.formState.errors.scheduledAt.message)
                : undefined
            }
          >
            <Input
              type="datetime-local"
              dir="ltr"
              value={toLocalInputValue(form.watch("scheduledAt"))}
              onChange={(e) => form.setValue("scheduledAt", new Date(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="تعيين سيارة (اختياري)" error={form.formState.errors.vehicleId?.message}>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              {...form.register("vehicleId")}
            >
              <option value="">بدون</option>
              {vehicles.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تعيين سائق (اختياري)" error={form.formState.errors.driverId?.message}>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              {...form.register("driverId")}
            >
              <option value="">بدون</option>
              {drivers.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الإيراد (ر.س)" error={form.formState.errors.revenueDzd?.message}>
            <Input type="number" {...form.register("revenueDzd")} />
          </Field>
          <Field label="التكلفة (ر.س)" error={form.formState.errors.costDzd?.message}>
            <Input type="number" {...form.register("costDzd")} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            إنشاء الطلب
          </Button>
        </div>
      </form>
    </div>
  );
}

function toLocalInputValue(date: Date | string | null | undefined) {
  const d = date ? new Date(date) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
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

