"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type PurchaseRow = {
  _id: string;
  status: "draft" | "submitted" | "approved" | "ordered" | "received" | "invoiced" | "paid" | "cancelled";
  title?: string;
  supplier?: string;
  totalSar?: number;
  createdAt?: string | Date;
  vehicleId?: { _id: string; matricule: string };
};

function statusLabel(s: PurchaseRow["status"]) {
  switch (s) {
    case "draft":
      return { label: "مسودة", variant: "default" as const };
    case "submitted":
      return { label: "مُرسل", variant: "info" as const };
    case "approved":
      return { label: "موافق", variant: "success" as const };
    case "ordered":
      return { label: "تم الطلب", variant: "default" as const };
    case "received":
      return { label: "تم الاستلام", variant: "success" as const };
    case "invoiced":
      return { label: "فاتورة", variant: "warning" as const };
    case "paid":
      return { label: "مدفوع", variant: "success" as const };
    case "cancelled":
      return { label: "ملغي", variant: "danger" as const };
  }
}

export const purchaseColumns: ColumnDef<PurchaseRow>[] = [
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const s = statusLabel(row.original.status);
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    accessorKey: "title",
    header: "العنوان",
    cell: ({ row }) => (
      <Link href={`/purchases/${row.original._id}`} className="font-semibold underline-offset-4 hover:underline">
        {row.original.title ?? "طلب مشتريات"}
      </Link>
    ),
  },
  {
    accessorKey: "supplier",
    header: "المورّد",
    cell: ({ row }) => <div className="text-sm">{row.original.supplier ?? "—"}</div>,
  },
  {
    id: "vehicle",
    header: "السيارة",
    cell: ({ row }) =>
      row.original.vehicleId ? (
        <Link href={`/fleet/${row.original.vehicleId._id}`} className="text-sm font-semibold underline-offset-4 hover:underline">
          {row.original.vehicleId.matricule}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "التاريخ",
    cell: ({ row }) => {
      const d = row.original.createdAt instanceof Date ? row.original.createdAt : new Date(row.original.createdAt ?? "");
      return <div className="text-sm">{Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ar-SA")}</div>;
    },
  },
];

