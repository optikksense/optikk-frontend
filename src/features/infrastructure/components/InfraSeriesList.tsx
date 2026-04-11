import { CHART_COLORS } from "@config/constants";
import { formatBytes, formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";
import { memo, useMemo } from "react";

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
  const maxVal = useMemo(
    () => Math.max(...series.map((s) => Math.abs(s.value)), 1),
    [series]
  );

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

  if (series.length === 0) return null;

  return (
    <div className="mt-2 border-t border-[var(--border-color)] pt-2">
      <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
              <th className="px-2 py-1 font-medium">Name</th>
              <th className="px-2 py-1 text-right font-medium">{title}</th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => {
              const isSelected = selectedKeys.length === 0 || selectedKeys.includes(item.key);
              const isFaded = selectedKeys.length > 0 && !isSelected;
              
              const pct = (Math.abs(item.value) / maxVal) * 100;
              const barWidth = Math.max(Math.min(pct, 100), 2);

              return (
                <tr
                  key={item.key}
                  onClick={() => onToggle?.(item.key)}
                  className={`cursor-pointer transition-colors hover:bg-[var(--white-04)] ${
                    isFaded ? "opacity-40" : "opacity-100"
                  } ${isSelected ? "bg-[var(--white-04)]" : "bg-transparent"}`}
                >
                  <td className="flex flex-col gap-1 px-2 py-1.5">
                    <span className="font-medium text-[var(--text-primary)]">
                      {item.label}
                    </span>
                    {/* Proportional bar */}
                    <div className="mt-0.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]/50">
                      <div
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: item.color,
                        }}
                        className="h-full rounded-sm"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-[var(--text-primary)]">
                    {formatValue(item.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default InfraSeriesList;
