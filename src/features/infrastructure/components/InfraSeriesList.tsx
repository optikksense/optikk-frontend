import DataTable from "@shared/components/ui/data-display/DataTable";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
} from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import { memo } from "react";

export interface InfraSeriesListItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface InfraSeriesListProps {
  series: InfraSeriesListItem[];
  selectedKeys?: string[];
  onToggle?: (key: string) => void;
  formatType?: "bytes" | "percentage" | "duration" | "number";
  title?: string;
}

const InfraSeriesList = memo(function InfraSeriesList({
  series,
  selectedKeys = [],
  onToggle,
  formatType = "number",
  title = "Value",
}: InfraSeriesListProps) {
  const maxVal = Math.max(...series.map((s) => Math.abs(s.value)), 1);

  const formatValue = (val: number) => {
    switch (formatType) {
      case "bytes":
        return formatBytes(val);
      case "percentage":
        return formatPercentage(val, 2, false);
      case "duration":
        return formatDuration(val);
      default:
        return formatNumber(val);
    }
  };

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
        <span className="font-mono text-foreground">{formatValue(item.value)}</span>
      ),
    },
  ];

  if (series.length === 0) return null;

  return (
    <div className="mt-2 border-border border-t pt-2">
      <DataTable
        data={{ columns, rows: series }}
        config={{
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
