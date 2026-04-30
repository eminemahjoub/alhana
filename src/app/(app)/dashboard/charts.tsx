"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatedCard } from "@/components/ux/animated-card";
import { Skeleton } from "@/components/ui/skeleton";

type ChartsResponse = {
  ok: boolean;
  data?: {
    series: Array<{
      day: string;
      orders: number;
    }>;
    status: Array<{ status: string; count: number }>;
  };
};

type ChartsData = NonNullable<ChartsResponse["data"]>;

const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  approved: "معتمد",
  on_road: "في الطريق",
  delivered: "مُسلم",
  cancelled: "ملغي",
};

const PIE_COLORS = ["#0a8e42", "#4ea8c0", "#eadf76", "#64ce93", "#1b7285", "#2b2b2b"];

export function DashboardCharts({ days = 14 }: { days?: number }) {
  const [loading, setLoading] = React.useState(true);
  const [series, setSeries] = React.useState<ChartsData["series"]>([]);
  const [status, setStatus] = React.useState<ChartsData["status"]>([]);

  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/charts?days=${days}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = (await res.json()) as ChartsResponse;
        if (!mounted) return;
        setSeries(json.data?.series ?? []);
        setStatus(json.data?.status ?? []);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name !== "AbortError") {
          setSeries([]);
          setStatus([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [days]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
      </div>
    );
  }

  const tooltipValue = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <AnimatedCard className="min-w-0">
        <div>
          <div className="text-sm font-bold">حالات الطلبات</div>
          <div className="text-xs text-muted-foreground">توزيع حسب الحالة</div>
        </div>
        <div className="mt-4 h-[240px] min-h-[240px] min-w-0 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ReTooltip
                formatter={(v: unknown) => [tooltipValue(v).toLocaleString("ar-SA"), "عدد"]}
              />
              <Pie data={status} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {status.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1">
          {status.slice(0, 6).map((s, idx) => (
            <div key={s.status} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground">{STATUS_LABEL[s.status] ?? s.status}</span>
              </div>
              <span className="font-semibold tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard className="min-w-0 xl:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">حجم الطلبات</div>
            <div className="text-xs text-muted-foreground">عدد الطلبات يوميًا</div>
          </div>
        </div>
        <div className="mt-4 h-[240px] min-h-[240px] min-w-0 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
              <ReTooltip
                formatter={(v: unknown) => [tooltipValue(v).toLocaleString("ar-SA"), "طلبات"]}
              />
              <Bar dataKey="orders" fill="#64ce93" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>
    </div>
  );
}

