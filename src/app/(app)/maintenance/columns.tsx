"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type MaintenanceRow = {
  _id: string;
  type: "oil_change" | "tires" | "brakes" | "inspection" | "repair" | "other";
  title?: string;
  performedAt: string | Date;
  odometerKm?: number;
  costSar?: number;
  supplier?: string;
  vehicleId?: {
    _id: string;
    matricule: string;
    brand?: string;
    model?: string;
    status?: string;
  };
};

function typeLabel(t: MaintenanceRow["type"]) {
  switch (t) {
    case "oil_change":
      return { label: "تبديل زيت", variant: "info" as const };
    case "inspection":
      return { label: "فحص", variant: "default" as const };
    case "repair":
      return { label: "تصليح", variant: "warning" as const };
    case "tires":
      return { label: "إطارات", variant: "default" as const };
    case "brakes":
      return { label: "فرامل", variant: "default" as const };
    case "other":
      return { label: "تقرير ميكانيك", variant: "success" as const };
  }
}

export const maintenanceColumns: ColumnDef<MaintenanceRow>[] = [
  {
    id: "vehicle",
    header: "السيارة",
    cell: ({ row }) => {
      const v = row.original.vehicleId;
      return v ? (
        <Link href={`/fleet/${v._id}`} className="font-semibold underline-offset-4 hover:underline">
          {v.matricule}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "النوع",
    cell: ({ row }) => {
      const t = typeLabel(row.original.type);
      return <Badge variant={t.variant}>{t.label}</Badge>;
    },
  },
  {
    accessorKey: "title",
    header: "العنوان",
    cell: ({ row }) => (
      <Link href={`/maintenance/${row.original._id}`} className="font-semibold underline-offset-4 hover:underline">
        {row.original.title ?? "تفاصيل"}
      </Link>
    ),
  },
  {
    accessorKey: "performedAt",
    header: "التاريخ",
    cell: ({ row }) => {
      const d = row.original.performedAt instanceof Date ? row.original.performedAt : new Date(row.original.performedAt);
      return <div className="text-sm">{Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ar-SA")}</div>;
    },
  },
  {
    accessorKey: "odometerKm",
    header: "الكيلومتراج",
    cell: ({ row }) => (
      <div className="tabular-nums">{typeof row.original.odometerKm === "number" ? `${row.original.odometerKm.toLocaleString("fr-DZ")} كم` : "—"}</div>
    ),
  },
  {
    accessorKey: "costSar",
    header: "التكلفة",
    cell: ({ row }) => (
      <div className="tabular-nums" dir="ltr">
        {typeof row.original.costSar === "number" ? row.original.costSar.toLocaleString("ar-SA") : "—"}
      </div>
    ),
  },
];

