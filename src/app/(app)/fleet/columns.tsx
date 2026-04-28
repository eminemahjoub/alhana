"use client";

import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type VehicleRow = {
  _id: string;
  matricule: string;
  brand: string;
  model: string;
  imageUrl?: string;
  color?: string;
  year?: number;
  odometerKm?: number;
  status: "available" | "on_road" | "maintenance" | "out_of_service";
};

function statusLabel(status: VehicleRow["status"]) {
  switch (status) {
    case "available":
      return { label: "متوفرة", variant: "success" as const };
    case "on_road":
      return { label: "في الطريق", variant: "info" as const };
    case "maintenance":
      return { label: "صيانة", variant: "warning" as const };
    case "out_of_service":
      return { label: "خارج الخدمة", variant: "danger" as const };
  }
}

export const vehicleColumns: ColumnDef<VehicleRow>[] = [
  {
    accessorKey: "matricule",
    header: "اللوحة",
    cell: ({ row }) => (
      <Link
        href={`/fleet/${row.original._id}`}
        className="font-bold tracking-tight underline-offset-4 hover:underline"
      >
        {row.original.matricule}
      </Link>
    ),
  },
  {
    id: "vehicle",
    header: "السيارة",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl border bg-muted">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt={`${row.original.brand} ${row.original.model}`}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : null}
        </div>
        <div>
          <div className="font-semibold">
            {row.original.brand} {row.original.model}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.color ?? "—"} {row.original.year ? `• ${row.original.year}` : ""}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "odometerKm",
    header: "الكيلومتراج",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {(row.original.odometerKm ?? 0).toLocaleString("fr-DZ")} كم
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const s = statusLabel(row.original.status);
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
];

