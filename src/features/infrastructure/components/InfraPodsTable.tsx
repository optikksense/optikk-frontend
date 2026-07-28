import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatDuration, formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import type { FleetPod } from "../types";
import { STATUS_COLOR, errorRateColor, trafficStatus } from "./tableCells";

const PAGE_SIZE = 10;

interface InfraPodsTableProps {
  readonly pods: readonly FleetPod[];
  readonly onOpenContainer: (container: string) => void;
  readonly onOpenHost: (host: string) => void;
}

function buildColumns(onOpenHost: (host: string) => void): ColumnDef<FleetPod>[] {
  return [
    {
      header: "Container",
      accessorKey: "podName",
      size: 260,
      cell: ({ row: { original: c } }) => (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: STATUS_COLOR[trafficStatus(c.errorRate)] }}
          />
          <div>
            <div className="font-medium font-mono text-[13px] text-foreground">{c.podName}</div>
            <div className="font-mono text-[11.5px] text-foreground-muted">
              {c.services.length > 0 ? c.services.join(", ") : "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Host",
      accessorKey: "host",
      cell: ({ row: { original: c } }) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            onOpenHost(c.host);
          }}
          className="font-mono text-[12.5px] text-primary hover:underline"
        >
          {c.host}
        </button>
      ),
    },
    {
      header: "Requests",
      accessorKey: "requestCount",
      size: 110,
      meta: { align: "right" },
      cell: ({ row: { original: c } }) => (
        <span className="font-mono text-[12.5px] text-foreground-muted">
          {formatNumber(c.requestCount)}
        </span>
      ),
    },
    {
      header: "Error rate",
      accessorKey: "errorRate",
      size: 100,
      meta: { align: "right" },
      cell: ({ row: { original: c } }) => (
        <span
          className="font-mono font-semibold text-[12.5px]"
          style={{ color: errorRateColor(c.errorRate) }}
        >
          {c.errorRate.toFixed(c.errorRate >= 10 ? 0 : 1)}%
        </span>
      ),
    },
    {
      header: "p95",
      accessorKey: "p95LatencyMs",
      size: 90,
      meta: { align: "right" },
      cell: ({ row: { original: c } }) => (
        <span className="font-mono text-[12.5px] text-foreground-muted">
          {formatDuration(c.p95LatencyMs)}
        </span>
      ),
    },
    {
      header: "Last seen",
      accessorKey: "lastSeen",
      size: 110,
      cell: ({ row: { original: c } }) => (
        <span className="font-mono text-[12px] text-foreground-muted">
          {formatRelativeTime(c.lastSeen)}
        </span>
      ),
    },
    {
      id: "open",
      header: "",
      size: 24,
      cell: () => <ChevronRight size={13} className="text-foreground-muted" />,
    },
  ];
}

export default function InfraPodsTable({ pods, onOpenContainer, onOpenHost }: InfraPodsTableProps) {
  const columns = useMemo(() => buildColumns(onOpenHost), [onOpenHost]);
  return (
    <DataTable
      data={{ columns, rows: [...pods] }}
      pagination={{ pageSize: PAGE_SIZE }}
      config={{
        onRow: (c) => ({
          onClick: () => onOpenContainer(c.podName),
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenContainer(c.podName);
            }
          },
          tabIndex: 0,
          className: "cursor-pointer transition-colors hover:bg-muted/40",
        }),
      }}
    />
  );
}
