"use client";

import * as React from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Search, CornerDownLeft, Clock, LayoutDashboard, Truck, Users, ClipboardList, Wrench, BarChart3, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Cmd = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
};

type VehicleHit = {
  _id: string;
  matricule: string;
  brand?: string;
  model?: string;
};

const RECENT_KEY = "alhana.recentSearches";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveRecent(value: string) {
  const v = value.trim();
  if (!v) return;
  const now = [v, ...loadRecent().filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(now));
}

type JsonOk<T> = { ok: true; data: T };
type JsonErr = { ok: false; message?: string; details?: unknown };
type JsonResponse<T> = JsonOk<T> | JsonErr;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState<string[]>([]);
  const [vehicles, setVehicles] = React.useState<VehicleHit[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => setRecent(loadRecent()), [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typeof e.key !== "string") return;
      const isK = e.key.toLowerCase() === "k";
      const mod = e.ctrlKey || e.metaKey;
      if (mod && isK) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    const handler = onOpen as EventListener;
    window.addEventListener("alhana:command", handler);
    return () => window.removeEventListener("alhana:command", handler);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (vehicles.length) return;
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
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
            const brand = asString(v.brand) || undefined;
            const model = asString(v.model) || undefined;
            return { _id, matricule, brand, model } satisfies VehicleHit;
          })
          .filter((v) => v._id && v.matricule);
        setVehicles(mapped);
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        if (name !== "AbortError") setVehicles([]);
      } finally {
        if (mounted) setVehiclesLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [open, vehicles.length]);

  const commands = React.useMemo<Cmd[]>(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
      router.refresh();
    };
    return [
      { id: "dashboard", title: "لوحة القيادة", subtitle: "Metrics & KPI", icon: <LayoutDashboard className="h-4 w-4" />, keywords: ["dashboard", "لوحة", "إحصائيات"], action: go("/dashboard") },
      { id: "orders", title: "طلبات النقل", subtitle: "Orders", icon: <ClipboardList className="h-4 w-4" />, keywords: ["orders", "طلبات", "نقل"], action: go("/orders") },
      { id: "new-order", title: "طلب نقل جديد", subtitle: "Create", icon: <CornerDownLeft className="h-4 w-4" />, keywords: ["new", "create", "طلب", "جديد"], action: go("/orders/new") },
      { id: "fleet", title: "إدارة الأسطول", subtitle: "Vehicles", icon: <Truck className="h-4 w-4" />, keywords: ["fleet", "vehicles", "سيارات", "أسطول"], action: go("/fleet") },
      { id: "drivers", title: "السائقون", subtitle: "Drivers", icon: <Users className="h-4 w-4" />, keywords: ["drivers", "سائق", "السائقون"], action: go("/drivers") },
      { id: "maintenance", title: "الوثائق والصيانة", subtitle: "Maintenance", icon: <Wrench className="h-4 w-4" />, keywords: ["maintenance", "صيانة", "وثائق"], action: go("/maintenance") },
      { id: "purchases", title: "طلبات المشتريات", subtitle: "Purchases", icon: <ShoppingCart className="h-4 w-4" />, keywords: ["purchases", "مشتريات", "طلب", "شراء"], action: go("/purchases") },
      { id: "reports", title: "التكاليف والتقارير", subtitle: "Reports", icon: <BarChart3 className="h-4 w-4" />, keywords: ["reports", "تقارير", "تكاليف"], action: go("/reports") },
    ];
  }, [router]);

  const vehicleCommands = React.useMemo<Cmd[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits = vehicles
      .filter((v) => v.matricule.toLowerCase().includes(q))
      .slice(0, 8);
    return hits.map((v) => ({
      id: `vehicle:${v._id}`,
      title: v.matricule,
      subtitle: [v.brand, v.model].filter(Boolean).join(" "),
      icon: <Truck className="h-4 w-4" />,
      keywords: ["matricule", "لوحة", "سيارة", v.matricule, v.brand ?? "", v.model ?? ""],
      action: () => {
        setOpen(false);
        router.push(`/fleet/${v._id}`);
        router.refresh();
      },
    }));
  }, [query, vehicles, router]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? commands
      : commands.filter((c) => {
          const hay = [c.title, c.subtitle ?? "", ...c.keywords].join(" ").toLowerCase();
          return hay.includes(q);
        });
    if (!q) return base;
    return [...vehicleCommands, ...base].filter((c) => {
      const hay = [c.title, c.subtitle ?? "", ...c.keywords].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [commands, query, vehicleCommands]);

  function run(cmd: Cmd) {
    if (query.trim()) saveRecent(query);
    cmd.action();
  }

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog
        onClose={() => setOpen(false)}
        className="relative z-[60]"
      >
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto px-4 py-10 sm:py-16">
          <div className="mx-auto w-full max-w-2xl">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-[0.98]"
            >
              <DialogPanel className="gradient-border">
                <div className="glass rounded-[1.25rem] p-3">
                  <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ابحث: طلبات، سائقين، سيارات…"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground" dir="ltr">
                      <span>Ctrl</span>
                      <span>K</span>
                    </div>
                  </div>

                  {recent.length && !query.trim() ? (
                    <div className="mt-3 rounded-xl border bg-background/40 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        عمليات بحث حديثة
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setQuery(r)}
                            className="rounded-full border bg-card/60 px-3 py-1 text-xs hover:bg-muted"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-3 max-h-[380px] overflow-auto rounded-xl border bg-background/40 p-2">
                    {filtered.length ? (
                      <div className="space-y-1">
                        {filtered.map((cmd) => (
                          <motion.button
                            key={cmd.id}
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => run(cmd)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-right transition",
                              "hover:bg-muted/60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-card/60 shadow-sm">
                                {cmd.icon}
                              </div>
                              <div className="leading-tight">
                                <div className="text-sm font-bold">{cmd.title}</div>
                                {cmd.subtitle ? (
                                  <div className="text-xs text-muted-foreground">{cmd.subtitle}</div>
                                ) : null}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">↵</div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        {vehiclesLoading ? "جاري تحميل الأسطول…" : "لا توجد نتائج."}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                    <div>Tab للتنقل — Enter للتنفيذ — Esc للإغلاق</div>
                    <div className="hidden sm:block">Luxury Command</div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

