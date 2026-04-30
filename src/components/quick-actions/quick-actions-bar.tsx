"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function QuickActionsBar() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <FloatingButton href="/purchases/new" label="طلب مشتريات" icon={<Plus className="h-5 w-5" />} gradient />
      <FloatingButton href="/maintenance/new" label="تقرير صيانة" icon={<Filter className="h-5 w-5" />} onClick={() => toast("اختصار", { description: "إضافة تقرير صيانة" })} />
      <motion.button
        type="button"
        whileHover={{ scale: 1.06, rotate: 1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => toast("نصيحة سريعة", { description: "اضغط Ctrl/⌘+K لفتح البحث العالمي." })}
        className="hidden sm:inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-card/70 shadow-luxury hover:bg-muted glass"
        aria-label="Tip"
      >
        <Sparkles className="h-5 w-5" />
      </motion.button>
    </div>
  );
}

function FloatingButton({
  href,
  label,
  icon,
  gradient,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  gradient?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        onClick={onClick}
        className={
          "group inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold shadow-luxury transition " +
          (gradient
            ? "bg-gradient-to-r from-[#0a8e42] via-[#4ea8c0] to-[#eadf76] text-[#0b1220]"
            : "glass border bg-card/70 hover:bg-muted")
        }
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/15">
          {icon}
        </span>
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </motion.div>
  );
}

