"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { Moon, Sun, Monitor, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/theme-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getTitle(pathname: string | null) {
  if (!pathname) return "لوحة التحكم";
  const exact = navItems.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const starts = navItems.find((i) => i.href !== "/" && pathname.startsWith(i.href));
  return starts?.label ?? "لوحة التحكم";
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { theme, setTheme, toggle, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/45">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div>
          <div className="text-sm font-bold tracking-tight">{title}</div>
          <div className="text-xs text-muted-foreground">
            Alhana Logistique — لوحة عربية (RTL)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-card/60 px-3 text-sm font-semibold shadow-sm hover:bg-muted"
                onClick={() => window.dispatchEvent(new CustomEvent("alhana:command"))}
                aria-label="بحث سريع"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">بحث</span>
                <span className="hidden sm:inline text-xs text-muted-foreground">Ctrl K</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>بحث عالمي (Ctrl/⌘ + K)</TooltipContent>
          </Tooltip>

          <div className="hidden sm:flex items-center gap-1 rounded-xl border bg-card/60 p-1 shadow-sm">
            <IconPill
              active={theme === "system"}
              title="System"
              onClick={() => setTheme("system")}
              icon={<Monitor className="h-4 w-4" />}
            />
            <IconPill
              active={theme === "light"}
              title="Light"
              onClick={() => setTheme("light")}
              icon={<Sun className="h-4 w-4" />}
            />
            <IconPill
              active={theme === "dark"}
              title="Dark"
              onClick={() => setTheme("dark")}
              icon={<Moon className="h-4 w-4" />}
            />
          </div>

          <Tooltip>
            <TooltipTrigger>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggle}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card/60 shadow-sm hover:bg-muted"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>تبديل المظهر</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

function IconPill({
  active,
  title,
  onClick,
  icon,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition " +
        (active ? "bg-primary text-primary-foreground shadow" : "text-foreground/70 hover:bg-muted")
      }
    >
      {icon}
    </button>
  );
}

