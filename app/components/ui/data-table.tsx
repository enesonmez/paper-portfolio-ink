import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

export interface DataTableColumn<TItem> {
  cellClassName?: string;
  header: ReactNode;
  headerClassName?: string;
  id: string;
  render: (item: TItem) => ReactNode;
}

interface DataTableProps<TItem> {
  bodyClassName?: string;
  columns: readonly DataTableColumn<TItem>[];
  emptyState?: ReactNode;
  emptyStateClassName?: string;
  getRowKey: (item: TItem) => string;
  rows: readonly TItem[];
  tableClassName?: string;
}

export function DataTable<TItem>({
  bodyClassName,
  columns,
  emptyState,
  emptyStateClassName,
  getRowKey,
  rows,
  tableClassName,
}: DataTableProps<TItem>) {
  return (
    <table className={cn("min-w-full border-collapse text-left", tableClassName)}>
      <thead className="bg-muted border-b-2 border-black">
        <tr>
          {columns.map((column) => (
            <th
              key={column.id}
              className={cn(
                "p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase",
                column.headerClassName,
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={bodyClassName}>
        {rows.length === 0 && emptyState ? (
          <tr>
            <td
              colSpan={columns.length}
              className={cn(
                "p-6 text-center text-sm font-bold uppercase",
                emptyStateClassName,
              )}
            >
              {emptyState}
            </td>
          </tr>
        ) : null}

        {rows.map((row) => (
          <tr key={getRowKey(row)} className="border-b border-black/10 last:border-b-0">
            {columns.map((column) => (
              <td key={column.id} className={cn("p-4", column.cellClassName)}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
