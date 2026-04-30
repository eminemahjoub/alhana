import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "لوحة القيادة" },
  { href: "/fleet", label: "إدارة الأسطول" },
  { href: "/drivers", label: "السائقون" },
  { href: "/orders", label: "طلبات النقل" },
  { href: "/maintenance", label: "الوثائق والصيانة" },
  { href: "/purchases", label: "طلبات المشتريات" },
  { href: "/reports", label: "التكاليف والتقارير" },
];

