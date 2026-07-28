import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { CHART_COLORS } from "@config/constants";
import { buildDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import type { DashboardDrawerAction } from "@shared/types/dashboardConfig";
import { formatNumber } from "@shared/utils/formatters";

import { APP_COLORS } from "@config/colorLiterals";
import { cn } from "@shared/lib/utils";

export type QueueMetricsListType = "depth" | "consumerLag" | "productionRate" | "consumptionRate";

export interface QueueMetricsItem {
  key?: string;
  queueName?: string;
  serviceName?: string;
  avgQueueDepth?: number;
  maxConsumerLag?: number;
  avgPublishRate?: number;
  avgReceiveRate?: number;
  [key: string]: unknown;
}

interface QueueMetricsListProps {
  title?: string;
  queues?: QueueMetricsItem[];
  selectedQueues?: string[];
  onToggle?: (queueKey: string) => void;
  type?: QueueMetricsListType;
  drawerAction?: DashboardDrawerAction;
  currentPathname?: string;
  currentSearch?: string | Record<string, unknown>;
  maxVisibleRows?: number;
}

interface QueueRowDisplayConfig {
  selectedBgClass: string;
  valueColorClass: string;
  displayValue: string;
}

function getQueueDisplayConfig(
  type: QueueMetricsListType,
  queue: QueueMetricsItem
): QueueRowDisplayConfig {
  if (type === "consumerLag") {
    const lag = queue.maxConsumerLag ?? 0;
    return {
      selectedBgClass: "bg-[#f04438]/12",
      valueColorClass: lag > 100 ? "text-[var(--color-error)]" : "text-[var(--text-primary)]",
      displayValue: formatNumber(lag),
    };
  }

  if (type === "productionRate") {
    return {
      selectedBgClass: "bg-[#f7b63a]/12",
      valueColorClass: "text-[var(--text-primary)]",
      displayValue: `${formatNumber(queue.avgPublishRate ?? 0)}/s`,
    };
  }

  if (type === "consumptionRate") {
    return {
      selectedBgClass: "bg-[#73c991]/12",
      valueColorClass: "text-[var(--text-primary)]",
      displayValue: `${formatNumber(queue.avgReceiveRate ?? 0)}/s`,
    };
  }

  return {
    selectedBgClass: "bg-[#7c7ff2]/12",
    valueColorClass: "text-[var(--text-primary)]",
    displayValue: formatNumber(queue.avgQueueDepth ?? 0),
  };
}

const getVal = (type: QueueMetricsListType, q: QueueMetricsItem) => {
  if (type === "consumerLag") return q.maxConsumerLag ?? 0;
  if (type === "productionRate") return q.avgPublishRate ?? 0;
  if (type === "consumptionRate") return q.avgReceiveRate ?? 0;
  return q.avgQueueDepth ?? 0;
};

   
                                                                   
                                
                                         
   
export default function QueueMetricsList({
  title,
  queues = [],
  selectedQueues = [],
  onToggle,
  type = "depth",
  drawerAction,
  currentPathname = "",
  currentSearch = "",
  maxVisibleRows,
}: QueueMetricsListProps): JSX.Element | null {
  const visibleQueues = maxVisibleRows ? queues.slice(0, maxVisibleRows) : queues;

  const maxValInList = useMemo(() => {
    return Math.max(...visibleQueues.map((q) => getVal(type, q)), 1);
  }, [visibleQueues, type]);
  if (queues.length === 0) return null;

  return (
    <div className="mt-0 border-[var(--border-color)] border-t">
      <div
        className="max-h-[180px] overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: `var(--border-color, ${APP_COLORS.hex_2d2d2d}) transparent`,
        }}
      >
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-[var(--border-color)] border-b text-[var(--text-secondary)]">
              <th className="px-2 py-1 font-medium">Topic Name</th>
              <th className="px-2 py-1 text-right font-medium">{title}</th>
              {drawerAction ? <th className="px-2 py-1 text-right font-medium">Details</th> : null}
            </tr>
          </thead>
          <tbody>
            {visibleQueues.map((queue, index) => {
              const queueKey =
                queue.key ??
                `${queue.queueName ?? "unknown"}::${queue.serviceName ?? "unknown"}::${index}`;
              const detailSearch = buildDashboardDrawerSearch(
                currentSearch,
                drawerAction,
                queue as Record<string, unknown>
              );
              const isSelected = selectedQueues.includes(queueKey);
              const isFaded = selectedQueues.length > 0 && !isSelected;
              const { selectedBgClass, valueColorClass, displayValue } = getQueueDisplayConfig(
                type,
                queue
              );

              const currentVal = getVal(type, queue);
              const pct = (currentVal / maxValInList) * 100;
              const barWidth = Math.max(Math.min(pct, 100), 2);

              const barBg =
                type === "consumerLag"
                  ? `linear-gradient(90deg, ${APP_COLORS.hex_f79009} 0%, ${APP_COLORS.hex_f04438} 100%)`
                  : type === "productionRate"
                    ? `linear-gradient(90deg, ${APP_COLORS.hex_ffd166} 0%, ${APP_COLORS.hex_f79009} 100%)`
                    : type === "consumptionRate"
                      ? `linear-gradient(90deg, ${APP_COLORS.hex_06d6a0} 0%, ${APP_COLORS.hex_73c991} 100%)`
                      : `linear-gradient(90deg, ${CHART_COLORS[1]} 0%, ${CHART_COLORS[0]} 100%)`;

              return (
                <tr
                  key={queueKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(queueKey);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onToggle?.(queueKey);
                    }
                  }}
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer transition-colors duration-200",
                    isFaded ? "opacity-40" : "opacity-100",
                    isSelected ? selectedBgClass : "bg-transparent hover:bg-white/5"
                  )}
                >
                  <td className="flex flex-col gap-1 px-2 py-1">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text-primary)]">
                        {queue.queueName}
                      </span>
                      {queue.serviceName && queue.serviceName !== "unknown" && (
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {queue.serviceName}
                        </span>
                      )}
                    </div>
                    <div className="mt-[2px] h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${barWidth}%`,
                          background: barBg,
                        }}
                      />
                    </div>
                  </td>
                  <td className={cn("px-2 py-1 text-right font-mono", valueColorClass)}>
                    {displayValue}
                  </td>
                  {drawerAction ? (
                    <td className="whitespace-nowrap px-2 py-1 text-right">
                      {detailSearch ? (
                        <Link
                          to={currentPathname + detailSearch}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-[12px] text-[var(--color-primary)] hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-[12px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
