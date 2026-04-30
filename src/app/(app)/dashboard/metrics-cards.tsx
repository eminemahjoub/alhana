"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard } from "@/components/ux/animated-card";
import { Skeleton } from "@/components/ui/skeleton";

type Metrics = {
  activeVehiclesOnRoad: number;
  deliveryRate: number;
  vehiclesTotal: number;
  vehiclesActive: number;
  vehiclesMaintenance: number;
  vehiclesInactive: number;
};

async function fetchMetrics(signal?: AbortSignal): Promise<Metrics> {
  const res = await fetch("/api/dashboard/metrics", { signal, cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; data?: Metrics };
  if (!res.ok || !json.ok || !json.data) throw new Error("Failed to load metrics");
  return json.data;
}

export function MetricsCards({ refreshMs = 10_000 }: { refreshMs?: number }) {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    let controller: AbortController | null = null;

    const load = async () => {
      try {
        controller?.abort();
        controller = new AbortController();
        const data = await fetchMetrics(controller.signal);
        if (mounted) setMetrics(data);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name === "AbortError") return;
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    const id = window.setInterval(load, refreshMs);
    return () => {
      mounted = false;
      controller?.abort();
      window.clearInterval(id);
    };
  }, [refreshMs]);

  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[110px]" />
        <Skeleton className="h-[110px]" />
        <Skeleton className="h-[110px]" />
        <Skeleton className="h-[110px]" />
      </div>
    );
  }

  const activeVehiclesOnRoad = metrics?.activeVehiclesOnRoad ?? 0;
  const deliveryRate = metrics?.deliveryRate ?? 0;
  const vehiclesTotal = metrics?.vehiclesTotal ?? 0;
  const vehiclesActive = metrics?.vehiclesActive ?? 0;
  const vehiclesMaintenance = metrics?.vehiclesMaintenance ?? 0;
  const vehiclesInactive = metrics?.vehiclesInactive ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="السيارات في الطريق" value={activeVehiclesOnRoad} hint="حالة: في الطريق" />
      <StatCard title="معدل التسليم" value={`${deliveryRate}%`} hint="طلبات مُسلمة اليوم" />
      <StatCard title="إجمالي السيارات" value={vehiclesTotal} hint="كل سيارات الأسطول" />
      <StatCard title="سيارات نشيطة" value={vehiclesActive} hint="غير خارجة عن الخدمة" />
      <StatCard title="تحت الصيانة" value={vehiclesMaintenance} hint="حالة: صيانة" />
      <StatCard title="غير نشيطة" value={vehiclesInactive} hint="خارج الخدمة/موقوفة" />
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  accent,
}: {
  title: string;
  value: string | number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <AnimatedCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{title}</div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={String(value)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums"
            >
              {value}
            </motion.div>
          </AnimatePresence>
        </div>
        <div
          className={
            "h-10 w-10 rounded-2xl border shadow-sm " +
            (accent ? "bg-accent/15 border-accent/30" : "bg-muted")
          }
        />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{hint}</div>
    </AnimatedCard>
  );
}

