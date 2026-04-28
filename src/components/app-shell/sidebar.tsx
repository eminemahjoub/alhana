"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-l bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 lg:block">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">Alhana Logistique</div>
          <div className="text-xs text-muted-foreground">مجموعة الهناء التجارية</div>
        </div>
        <div className="h-9 w-9 rounded-xl border bg-background shadow-sm" />
      </div>

      <nav className="px-3 pb-6">
        <div className="mt-2 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="font-semibold">{item.label}</span>
                <span
                  className={cx(
                    "h-2 w-2 rounded-full",
                    active ? "bg-accent" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Alhana Logistique</div>
      </div>
    </aside>
  );
}

