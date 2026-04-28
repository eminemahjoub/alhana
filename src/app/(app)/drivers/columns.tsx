"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type DriverRow = {
  _id: string;
  fullName: string;
  phone?: string;
  idNumber?: string;
  iqamaImageUrl?: string;
  licenseNumber: string;
  licenseCategory?: string;
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
    accessorKey: "idNumber",
    header: "الهوية",
    cell: ({ row }) => (
      <div className="text-sm font-semibold" dir="ltr">
        {row.original.idNumber ?? "—"}
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
    accessorKey: "iqamaImageUrl",
    header: "الإقامة",
    cell: ({ row }) =>
      row.original.iqamaImageUrl ? (
        <a
          className="text-sm font-semibold underline"
          href={row.original.iqamaImageUrl}
          target="_blank"
          rel="noreferrer"
        >
          عرض
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
];

