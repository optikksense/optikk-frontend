import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { memo } from "react";

import { type SeriesFormat, formatSeriesValue } from "./seriesFormat";

export interface InfraSeriesListItem {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

/** Label line (20) + gap (4) + bar (3 + 2 offset) + cell padding (16) + border (1). */
const ROW_HEIGHT = 46;
/** Rows visible before the list scrolls, keeping every chart card the same height. */
const DEFAULT_MAX_ROWS = 4;

interface InfraSeriesListProps {
  readonly series: readonly InfraSeriesListItem[];
  readonly selectedKeys?: readonly string[];
  readonly onToggle?: (key: string) => void;
  readonly format?: SeriesFormat;
  readonly title?: string;
  readonly maxRows?: number;
}

const InfraSeriesList = memo(function InfraSeriesList({
  series,
  selectedKeys = [],
  onToggle,
  format = "number",
  title = "Value",
  maxRows = DEFAULT_MAX_ROWS,
}: InfraSeriesListProps) {
  const maxVal = Math.max(...series.map((s) => Math.abs(s.value)), 1);

  const columns: ColumnDef<InfraSeriesListItem>[] = [
    {
      header: "Name",
      accessorKey: "label",
      cell: ({ row: { original: item } }) => {
        const pct = (Math.abs(item.value) / maxVal) * 100;
        const barWidth = Math.max(Math.min(pct, 100), 2);
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">{item.label}</span>
            <div className="mt-0.5 h-[3px] w-full overflow-hidden rounded-full bg-muted/50">
              <div
                style={{ width: `${barWidth}%`, backgroundColor: item.color }}
                className="h-full rounded-sm"
              />
            </div>
          </div>
        );
      },
    },
    {
      header: title,
      accessorKey: "value",
      meta: { align: "right" },
      cell: ({ row: { original: item } }) => (
        <span className="font-mono text-foreground">{formatSeriesValue(item.value, format)}</span>
      ),
    },
  ];

  if (series.length === 0) return null;

  return (
    <div className="mt-2 border-border border-t pt-2">
      <DataTable
        data={{ columns, rows: [...series] }}
        config={{
          maxRows,
          rowHeight: ROW_HEIGHT,
          onRow: (item) => {
            const isSelected = selectedKeys.length === 0 || selectedKeys.includes(item.key);
            const isFaded = selectedKeys.length > 0 && !isSelected;
            return {
              onClick: () => onToggle?.(item.key),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggle?.(item.key);
                }
              },
              tabIndex: 0,
              className: `cursor-pointer transition-colors hover:bg-[var(--white-04)] ${
                isFaded ? "opacity-40" : "opacity-100"
              } ${isSelected ? "bg-[var(--white-04)]" : "bg-transparent"}`,
            };
          },
        }}
      />
    </div>
  );
});

export default InfraSeriesList;
