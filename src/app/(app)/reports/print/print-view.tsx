"use client";

import * as React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintClientActions } from "./print-client";

type Summary = {
  range: { start: string; end: string };
  maintenance: {
    totalCostSar: number;
    count: number;
    byType: Array<{ type: string; costSar: number; count: number }>;
  };
  purchases: { count: number; byStatus: Array<{ status: string; count: number }> };
  orders: { count: number; totalCostSar: number };
};

function formatSAR(value: number) {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(value);
}

export function ReportsPrintClient({ start, end }: { start: string; end: string }) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Summary | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        if (!start || !end) throw new Error("Missing start/end");
        const res = await fetch(`/api/reports/summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Summary; message?: string } | null;
        if (!res.ok || !json?.ok || !json.data) throw new Error(json?.message ?? "Failed");
        if (mounted) setData(json.data);
      } catch (e) {
        if (mounted) {
          setData(null);
          setErr(e instanceof Error ? e.message : "Failed");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [start, end]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <div className="rounded-2xl border bg-background/30 p-4 text-sm text-muted-foreground">تعذر تحميل التقرير: {err ?? "—"}</div>
        <Link href="/reports" className="text-sm underline">
          رجوع
        </Link>
      </div>
    );
  }

  const rangeLabel = `${new Date(data.range.start).toLocaleDateString("ar-SA")} → ${new Date(data.range.end).toLocaleDateString("ar-SA")}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-white p-6 text-black">
      <style>{`
        @media print {
          body { background: white !important; }
          a { text-decoration: none !important; color: inherit !important; }
        }
      `}</style>

      <PrintClientActions />

      <div className="print:hidden">
        <Link href={`/reports`} className="text-sm underline">
          رجوع للتقارير
        </Link>
      </div>

      <header className="space-y-2 border-b pb-4">
        <div className="text-2xl font-extrabold">تقرير التكاليف</div>
        <div className="text-sm text-black/70">الفترة: {rangeLabel}</div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Box title="تكاليف الصيانة" value={formatSAR(data.maintenance.totalCostSar)} hint={`${data.maintenance.count} تقرير`} />
        <Box title="طلبات المشتريات" value={data.purchases.count.toLocaleString("ar-SA")} hint="عدد الطلبات" />
        <Box title="تكلفة طلبات النقل" value={formatSAR(data.orders.totalCostSar)} hint={`${data.orders.count} طلب`} />
      </section>

      <section className="space-y-2">
        <div className="text-sm font-bold">الصيانة حسب النوع</div>
        <Table>
          <thead>
            <tr>
              <Th>النوع</Th>
              <Th>التقارير</Th>
              <Th>التكلفة</Th>
            </tr>
          </thead>
          <tbody>
            {data.maintenance.byType.map((r) => (
              <tr key={r.type} className="border-t">
                <Td>{r.type}</Td>
                <Td>{r.count.toLocaleString("ar-SA")}</Td>
                <Td dir="ltr">{formatSAR(r.costSar)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-bold">طلبات المشتريات حسب الحالة</div>
        <Table>
          <thead>
            <tr>
              <Th>الحالة</Th>
              <Th>العدد</Th>
            </tr>
          </thead>
          <tbody>
            {data.purchases.byStatus.map((s) => (
              <tr key={s.status} className="border-t">
                <Td>{s.status}</Td>
                <Td>{s.count.toLocaleString("ar-SA")}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}

function Box({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs font-semibold text-black/60">{title}</div>
      <div className="mt-1 text-xl font-extrabold tabular-nums" dir="ltr">
        {value}
      </div>
      <div className="mt-1 text-xs text-black/60">{hint}</div>
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full overflow-hidden rounded-xl border text-sm">{children}</table>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-black/5 px-3 py-2 text-right font-semibold">{children}</th>;
}

function Td({ children, dir }: { children: React.ReactNode; dir?: "ltr" | "rtl" }) {
  return (
    <td className="px-3 py-2" dir={dir}>
      {children}
    </td>
  );
}

