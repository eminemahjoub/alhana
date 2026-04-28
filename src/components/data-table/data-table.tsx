"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "بحث...",
  searchColumnId,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : undefined;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={(searchColumn?.getFilterValue() as string) ?? ""}
            onChange={(event) => searchColumn?.setFilterValue(event.target.value)}
            className={cn("w-full sm:w-80", !searchColumnId && "opacity-50")}
            disabled={!searchColumnId}
          />
          <div className="hidden sm:block text-xs text-muted-foreground">
            {filteredCount.toLocaleString("fr-DZ")} نتيجة
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-muted-foreground tabular-nums" dir="ltr">
            {pageCount ? `${pageIndex + 1}/${pageCount}` : "—"}
          </div>
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </Button>
          <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            التالي
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                لا توجد بيانات.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

