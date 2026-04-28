"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type DriverRow = {
  _id: string;
  fullName: string;
  phone?: string;
  licenseNumber: string;
  licenseCategory?: string;
  status: "active" | "inactive" | "suspended";
  isAvailable: boolean;
};

export const driverColumns: ColumnDef<DriverRow>[] = [
  {
    accessorKey: "fullName",
    header: "السائق",
    cell: ({ row }) => (
      <div>
        <div className="font-bold">{row.original.fullName}</div>
        <div className="text-xs text-muted-foreground" dir="ltr">
          {row.original.phone ?? "—"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "licenseNumber",
    header: "الرخصة",
    cell: ({ row }) => (
      <div className="text-sm" dir="ltr">
        {row.original.licenseNumber}
        {row.original.licenseCategory ? (
          <div className="text-xs text-muted-foreground">فئة: {row.original.licenseCategory}</div>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "isAvailable",
    header: "التوفر",
    cell: ({ row }) => (
      <Badge variant={row.original.isAvailable ? "success" : "warning"}>
        {row.original.isAvailable ? "متوفر" : "غير متوفر"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "info" : row.original.status === "inactive" ? "default" : "danger"}
      >
        {row.original.status === "active" ? "نشط" : row.original.status === "inactive" ? "غير نشط" : "موقوف"}
      </Badge>
    ),
  },
];

