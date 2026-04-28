"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type DriverListItem = {
  _id: string;
  fullName: string;
  phone?: string;
  licenseCategory?: string;
};

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; message?: string; details?: unknown };
type JsonResponse<T> = JsonOk<T> | JsonErr;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function AssignDriver({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [drivers, setDrivers] = React.useState<DriverListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/drivers", { signal: controller.signal, cache: "no-store" });
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
            const d = isRecord(raw) ? raw : {};
            const _id = String(d._id ?? "");
            const fullName = String(d.fullName ?? "");
            return {
              _id,
              fullName,
              phone: typeof d.phone === "string" ? d.phone : undefined,
              licenseCategory: typeof d.licenseCategory === "string" ? d.licenseCategory : undefined,
            } satisfies DriverListItem;
          })
          .filter((d) => d._id && d.fullName);
        setDrivers(mapped);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name !== "AbortError") setDrivers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function assign() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: selected }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !json?.ok) throw new Error(json?.message ?? "تعذر التعيين");
      toast("تم تعيين السائق بنجاح");
      router.refresh();
    } catch {
      toast("تعذر تعيين السائق");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-background/30 p-4">
      <div className="text-sm font-bold">تعيين سائق</div>
      <div className="mt-3 space-y-2">
        <Label>اختر سائق</Label>
        <select
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loading || saving}
        >
          <option value="">{loading ? "جاري التحميل..." : "اختر"}</option>
          {drivers.map((d) => (
            <option key={d._id} value={d._id}>
              {d.fullName}
              {d.phone ? ` — ${d.phone}` : ""}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <Button type="button" onClick={() => void assign()} disabled={!selected || saving}>
            تعيين
          </Button>
        </div>
      </div>
    </div>
  );
}

