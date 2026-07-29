import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { InfrastructureNodeService } from "../types";
import {
  EntityNameCell,
  chevronColumn,
  clickableRow,
  errorRateColumn,
  latencyColumn,
  numericColumn,
} from "./tableCells";

const PAGE_SIZE = 10;

interface InfraServicesTableProps {
  readonly services: readonly InfrastructureNodeService[];
  readonly onOpenService: (serviceName: string) => void;
  readonly isPending?: boolean;
  readonly emptyText?: string;
}

const COLUMNS: ColumnDef<InfrastructureNodeService>[] = [
  {
    id: "Service",
    header: "Service",
    accessorFn: (s) => s.serviceName,
    size: 260,
    cell: ({ row: { original: s } }) => (
      <EntityNameCell
        name={s.serviceName}
        sublabel={`${s.podCount} ${s.podCount === 1 ? "pod" : "pods"}`}
        errorRate={s.errorRate}
      />
    ),
  },
  numericColumn<InfrastructureNodeService>("Requests", (s) => s.requestCount),
  numericColumn<InfrastructureNodeService>("Errors", (s) => s.errorCount, 100),
  errorRateColumn<InfrastructureNodeService>("Error rate", (s) => s.errorRate),
  latencyColumn<InfrastructureNodeService>("Avg latency", (s) => s.avgLatencyMs, 120),
  latencyColumn<InfrastructureNodeService>("p95", (s) => s.p95LatencyMs, 90),
  chevronColumn<InfrastructureNodeService>(),
];

export default function InfraServicesTable({
  services,
  onOpenService,
  isPending,
  emptyText,
}: InfraServicesTableProps) {
  return (
    <DataTable
      data={{ columns: COLUMNS, rows: [...services], loading: isPending }}
      pagination={{ pageSize: PAGE_SIZE }}
      config={{
        onRow: clickableRow((s: InfrastructureNodeService) => onOpenService(s.serviceName)),
        emptyText,
      }}
    />
  );
}
