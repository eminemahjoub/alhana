"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/currency";

export type OrderRow = {
  _id: string;
  orderNo: string;
  clientName: string;
  scheduledAt: string; // ISO
  status: "new" | "approved" | "on_road" | "delivered" | "cancelled";
  vehicle?: string;
  driver?: string;
  revenueDzd?: number;
};

function statusMeta(status: OrderRow["status"]) {
  switch (status) {
    case "new":
      return { label: "جديد", variant: "default" as const };
    case "approved":
      return { label: "معتمد", variant: "info" as const };
    case "on_road":
      return { label: "في الطريق", variant: "warning" as const };
    case "delivered":
      return { label: "مُسلم", variant: "success" as const };
    case "cancelled":
      return { label: "ملغي", variant: "danger" as const };
  }
}

export const orderColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "orderNo",
    header: "رقم الطلب",
    cell: ({ row }) => <div className="font-bold">{row.original.orderNo}</div>,
  },
  {
    accessorKey: "clientName",
    header: "العميل",
    cell: ({ row }) => <div className="font-semibold">{row.original.clientName}</div>,
  },
  {
    accessorKey: "scheduledAt",
    header: "التاريخ/الوقت",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums" dir="ltr">
        {new Date(row.original.scheduledAt).toLocaleString("fr-DZ")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const s = statusMeta(row.original.status);
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    id: "assignment",
    header: "التعيين",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <div>{row.original.vehicle ?? "—"}</div>
        <div>{row.original.driver ?? "—"}</div>
      </div>
    ),
  },
  {
    accessorKey: "revenueDzd",
    header: "الإيراد",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatSAR(row.original.revenueDzd ?? 0)}
      </div>
    ),
  },
];

