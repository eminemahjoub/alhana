"use client";

import * as React from "react";
import Link from "next/link";
import { formatSAR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Summary = {
  range: { start: string; end: string };
  maintenance: {
    totalCostSar: number;
    count: number;
    byType: Array<{ type: string; costSar: number; count: number }>;
    topVehicles: Array<{
      vehicleId: string;
      vehicle: { matricule?: string; brand?: string; model?: string } | null;
      costSar: number;
      count: number;
    }>;
  };
  purchases: {
    count: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  orders: {
    count: number;
    totalCostSar: number;
  };
};

function toISODateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ReportsClient() {
  const today = React.useMemo(() => new Date(), []);
  const defaultEnd = React.useMemo(() => toISODateInput(today), [today]);
  const defaultStart = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return toISODateInput(d);
  }, [today]);

  const [start, setStart] = React.useState(defaultStart);
  const [end, setEnd] = React.useState(defaultEnd);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Summary | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function load(nextStart: string, nextEnd: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/reports/summary?start=${encodeURIComponent(nextStart)}&end=${encodeURIComponent(nextEnd)}`, {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Summary; message?: string } | null;
      if (!res.ok || !json?.ok || !json.data) throw new Error(json?.message ?? "Failed");
      setData(json.data);
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printHref = `/reports/print?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">التكاليف والتقارير</h2>
          <p className="text-sm text-muted-foreground">ملخّص تكاليف الصيانة والمشتريات وتكاليف الطلبات خلال فترة.</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground">من</div>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-10 w-[170px]" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground">إلى</div>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-10 w-[170px]" />
          </div>
          <Button type="button" onClick={() => void load(start, end)} disabled={loading}>
            تحديث
          </Button>
          <Link href={printHref} className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold hover:bg-muted">
            طباعة / PDF
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      ) : err ? (
        <div className="rounded-2xl border bg-background/30 p-4 text-sm text-muted-foreground">تعذر تحميل التقرير: {err}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card title="تكاليف الصيانة" value={formatSAR(data.maintenance.totalCostSar)} hint={`${data.maintenance.count} تقرير`} />
            <Card title="طلبات المشتريات" value={data.purchases.count.toLocaleString("ar-SA")} hint="عدد الطلبات خلال الفترة" />
            <Card title="تكلفة طلبات النقل" value={formatSAR(data.orders.totalCostSar)} hint={`${data.orders.count} طلب`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border bg-background/30 p-4">
              <div className="text-sm font-bold">الصيانة حسب النوع</div>
              <div className="mt-3 overflow-hidden rounded-xl border bg-card/40">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-right font-semibold">النوع</th>
                      <th className="px-3 py-2 text-right font-semibold">التقارير</th>
                      <th className="px-3 py-2 text-right font-semibold">التكلفة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.maintenance.byType.length ? (
                      data.maintenance.byType.map((r) => (
                        <tr key={r.type} className="border-t">
                          <td className="px-3 py-2">{r.type}</td>
                          <td className="px-3 py-2 tabular-nums">{r.count.toLocaleString("ar-SA")}</td>
                          <td className="px-3 py-2 tabular-nums" dir="ltr">
                            {formatSAR(r.costSar)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t">
                        <td className="px-3 py-6 text-center text-muted-foreground" colSpan={3}>
                          لا يوجد بيانات.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border bg-background/30 p-4">
              <div className="text-sm font-bold">طلبات المشتريات حسب الحالة</div>
              <div className="mt-3 space-y-2">
                {data.purchases.byStatus.length ? (
                  data.purchases.byStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-sm">
                      <div className="text-muted-foreground">{s.status}</div>
                      <div className="font-semibold tabular-nums">{s.count.toLocaleString("ar-SA")}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">لا يوجد بيانات.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/30 p-4">
            <div className="text-sm font-bold">أعلى السيارات تكلفة (صيانة)</div>
            <div className="mt-3 overflow-hidden rounded-xl border bg-card/40">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-right font-semibold">السيارة</th>
                    <th className="px-3 py-2 text-right font-semibold">التقارير</th>
                    <th className="px-3 py-2 text-right font-semibold">التكلفة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.maintenance.topVehicles.length ? (
                    data.maintenance.topVehicles.map((v) => (
                      <tr key={v.vehicleId} className="border-t">
                        <td className="px-3 py-2">
                          <Link href={`/fleet/${v.vehicleId}`} className="font-semibold underline-offset-4 hover:underline">
                            {v.vehicle?.matricule ?? "—"}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {(v.vehicle?.brand ?? "") + " " + (v.vehicle?.model ?? "")}
                          </div>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{v.count.toLocaleString("ar-SA")}</td>
                        <td className="px-3 py-2 tabular-nums" dir="ltr">
                          {formatSAR(v.costSar)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td className="px-3 py-6 text-center text-muted-foreground" colSpan={3}>
                        لا يوجد بيانات.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border bg-background/30 p-4">
      <div className="text-xs font-semibold text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums" dir="ltr">
        {value}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

