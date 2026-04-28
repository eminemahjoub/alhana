"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPurchaseSchema, purchaseItemSchema } from "@/schemas/purchase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formSchema = createPurchaseSchema.extend({
  items: z.array(purchaseItemSchema).default([]),
});
type Values = z.input<typeof formSchema>;

type VehicleHit = { _id: string; matricule: string; brand?: string; model?: string };

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; message?: string; details?: unknown };
type JsonResponse<T> = JsonOk<T> | JsonErr;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = React.useState<VehicleHit[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      supplier: "",
      notes: "",
      vehicleId: "",
      items: [{ name: "", qty: 1, unitPriceSar: 0, totalSar: 0 }],
    },
  });

  const itemsArr = useFieldArray({ control: form.control, name: "items" });

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

  function recalcTotals() {
    const items = form.getValues("items") ?? [];
    items.forEach((it, idx) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.unitPriceSar) || 0;
      form.setValue(`items.${idx}.totalSar`, Math.max(0, qty * price), { shouldDirty: true });
    });
  }

  async function onSubmit(values: Values) {
    recalcTotals();
    const payload = { ...values, items: form.getValues("items") };
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { _id?: string }; message?: string } | null;
    if (!res.ok || !json?.ok || !json.data?._id) {
      toast(json?.message ?? "تعذر إنشاء الطلب");
      return;
    }
    toast("تم إنشاء طلب المشتريات");
    router.push(`/purchases/${json.data._id}`);
    router.refresh();
  }

  const items = form.watch("items") ?? [];
  const total = items.reduce((acc, it) => acc + (Number(it.totalSar) || 0), 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold">طلب مشتريات جديد</h2>
        <p className="text-sm text-muted-foreground">أنشئ طلب ثم أكمله بالخطوات: موافقة → استلام → فاتورة → دفع.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input {...form.register("title")} placeholder="مثال: قطع غيار - Toyota" />
          </div>
          <div className="space-y-2">
            <Label>المورّد</Label>
            <Input {...form.register("supplier")} placeholder="اسم المورد/المحل" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>السيارة (اختياري)</Label>
            <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...form.register("vehicleId")}>
              <option value="">{vehiclesLoading ? "جاري التحميل..." : "بدون"}</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.matricule} — {v.brand ?? ""} {v.model ?? ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Input {...form.register("notes")} placeholder="أي تفاصيل إضافية" />
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold">بنود الطلب</div>
              <div className="text-xs text-muted-foreground">الكمية × سعر الوحدة = الإجمالي</div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => itemsArr.append({ name: "", qty: 1, unitPriceSar: 0, totalSar: 0 })}
            >
              إضافة بند
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {itemsArr.fields.map((f, idx) => (
              <div key={f.id} className="grid grid-cols-1 gap-3 rounded-2xl border bg-card/40 p-3 sm:grid-cols-12">
                <div className="sm:col-span-6 space-y-2">
                  <Label>الصنف</Label>
                  <Input {...form.register(`items.${idx}.name` as const)} placeholder="مثال: زيت محرك" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    {...form.register(`items.${idx}.qty` as const, { valueAsNumber: true })}
                    onChange={(e) => {
                      form.setValue(`items.${idx}.qty`, Number(e.target.value) || 0, { shouldDirty: true });
                      recalcTotals();
                    }}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>سعر الوحدة</Label>
                  <Input
                    type="number"
                    {...form.register(`items.${idx}.unitPriceSar` as const, { valueAsNumber: true })}
                    onChange={(e) => {
                      form.setValue(`items.${idx}.unitPriceSar`, Number(e.target.value) || 0, { shouldDirty: true });
                      recalcTotals();
                    }}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>الإجمالي</Label>
                  <Input type="number" value={Number(items[idx]?.totalSar ?? 0)} readOnly />
                </div>
                <div className="sm:col-span-12 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => itemsArr.remove(idx)} disabled={itemsArr.fields.length === 1}>
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border bg-card/40 px-4 py-3">
            <div className="text-sm text-muted-foreground">الإجمالي</div>
            <div className="text-lg font-extrabold tabular-nums" dir="ltr">
              {total.toLocaleString("ar-SA")} SAR
            </div>
          </div>
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

