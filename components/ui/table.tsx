import { cn } from "@/src/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
};

type TableProps<T> = HTMLAttributes<HTMLTableElement> & {
  data: T[];
  columns: Column<T>[];
  emptyState?: string;
};

export function DataTable<T>({
  data,
  columns,
  emptyState = "No records yet.",
  className,
  ...props
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className={cn("w-full table-auto text-sm", className)} {...props}>
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 text-left font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
                {emptyState}
              </td>
            </tr>
          )}
          {data.map((row, index) => (
            <tr key={index} className="border-t border-border/60">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3">
                  {column.render
                    ? column.render(row, index)
                    : ((row as Record<string, unknown>)[column.key as string] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

