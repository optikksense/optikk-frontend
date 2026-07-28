import { type ReactNode, useMemo } from "react";

import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { cn } from "@shared/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

import {
  type ConsumerGroupRow,
  type ConsumptionRow,
  type ProductionRow,
  buildKafkaPageModel,
  formatMilliseconds,
  formatPercent,
  formatRate,
  healthFromError,
} from "../kafkaPageModel";
import { KafkaTopologyGraph } from "./KafkaTopologyGraph";

type TopicRow = KafkaTopology["topics"][number];

function Panel({
  title,
  description,
  children,
}: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <header className="border-border border-b px-4 py-3">
        <h2 className="font-semibold text-[13px] text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[11px] text-foreground-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="text-[11px] text-foreground-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-semibold text-[22px] text-foreground tabular-nums">{value}</span>
        {unit ? <span className="text-[11px] text-foreground-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

function ErrorRate({ value }: { value: number }) {
  const health = healthFromError(value);
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        health === "critical"
          ? "text-error"
          : health === "warning"
            ? "text-warning"
            : "text-success"
      )}
    >
      {formatPercent(value)}
    </span>
  );
}

function SummaryValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-3 py-2.5">
      <div className="text-[10px] text-foreground-muted">{label}</div>
      <div className="mt-0.5 font-semibold text-[13px] tabular-nums">{children}</div>
    </div>
  );
}

const PRODUCTION_COLUMNS: ColumnDef<ProductionRow>[] = [
  {
    header: "Topic",
    accessorKey: "topic",
    cell: ({ row: { original: row } }) => (
      <span className="font-medium font-mono">{row.topic}</span>
    ),
  },
  {
    header: "Messages/sec",
    accessorKey: "rate",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatRate(row.rate)}</span>
    ),
  },
  {
    header: "Producers",
    accessorKey: "producerCount",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="tabular-nums">{row.producerCount}</span>,
  },
  {
    header: "Groups",
    accessorKey: "consumerGroupCount",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{row.consumerGroupCount}</span>
    ),
  },
];

const CONSUMPTION_COLUMNS: ColumnDef<ConsumptionRow>[] = [
  {
    header: "Consumer group",
    accessorKey: "group",
    cell: ({ row: { original: row } }) => (
      <span className="font-medium font-mono">{row.group}</span>
    ),
  },
  {
    header: "Topics",
    accessorKey: "topics",
    cell: ({ row: { original: row } }) => (
      <span className="block max-w-48 truncate text-foreground-muted" title={row.topics.join(", ")}>
        {row.topics.join(", ") || "—"}
      </span>
    ),
  },
  {
    header: "Messages/sec",
    accessorKey: "rate",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatRate(row.rate)}</span>
    ),
  },
  {
    header: "P50",
    accessorKey: "p50Ms",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatMilliseconds(row.p50Ms)}</span>
    ),
  },
  {
    header: "P95",
    accessorKey: "p95Ms",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatMilliseconds(row.p95Ms)}</span>
    ),
  },
  {
    header: "P99",
    accessorKey: "p99Ms",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatMilliseconds(row.p99Ms)}</span>
    ),
  },
  {
    header: "Errors",
    accessorKey: "errorRate",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <ErrorRate value={row.errorRate} />,
  },
];

const TOPIC_COLUMNS: ColumnDef<TopicRow>[] = [
  {
    header: "Topic",
    accessorKey: "topic",
    cell: ({ row: { original: row } }) => (
      <span className="font-medium font-mono">{row.topic}</span>
    ),
  },
  {
    header: "Messages/sec",
    accessorKey: "ratePerSec",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatRate(row.ratePerSec)}</span>
    ),
  },
  {
    header: "Producers",
    accessorKey: "producerCount",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="tabular-nums">{row.producerCount}</span>,
  },
  {
    header: "Groups",
    accessorKey: "consumerGroupCount",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{row.consumerGroupCount}</span>
    ),
  },
];

const GROUP_COLUMNS: ColumnDef<ConsumerGroupRow>[] = [
  {
    header: "Group",
    accessorKey: "group",
    cell: ({ row: { original: row } }) => (
      <span className="font-medium font-mono">{row.group}</span>
    ),
  },
  {
    header: "Consumer",
    accessorKey: "consumer",
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-foreground-muted">{row.consumer}</span>
    ),
  },
  {
    header: "Topic",
    accessorKey: "topic",
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-foreground-muted">{row.topic}</span>
    ),
  },
  {
    header: "Messages/sec",
    accessorKey: "rate",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="tabular-nums">{formatRate(row.rate)}</span>
    ),
  },
  {
    header: "Errors",
    accessorKey: "errorRate",
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <ErrorRate value={row.errorRate} />,
  },
];

interface KafkaServiceOverviewProps {
  readonly service: string;
  readonly topology: KafkaTopology;
  readonly onSelectService: (service: string) => void;
}

export function KafkaServiceOverview({
  service,
  topology,
  onSelectService,
}: KafkaServiceOverviewProps) {
  const model = useMemo(() => buildKafkaPageModel(topology, service), [topology, service]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Produced messages"
          value={formatRate(model.productionRate)}
          unit="/sec"
        />
        <MetricCard
          label="Consumed messages"
          value={formatRate(model.consumptionRate)}
          unit="/sec"
        />
        <MetricCard label="Topics in scope" value={String(model.topicCount)} />
        <MetricCard label="Consumer groups" value={String(model.consumerGroupCount)} />
      </div>

      <Panel title={`Topology · ${service}`} description="Producers → topics → consumers">
        <KafkaTopologyGraph topology={topology} onSelectService={onSelectService} />
      </Panel>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Panel title="Production metrics" description={`Messages published by ${service}`}>
          <div className="overflow-x-auto border-border border-b">
            <div className="grid min-w-[560px] grid-cols-5 divide-x divide-border bg-muted/20">
              <SummaryValue label="Throughput">{formatRate(model.productionRate)}/s</SummaryValue>
              <SummaryValue label="Error rate">
                <ErrorRate value={model.productionErrorRate} />
              </SummaryValue>
              <SummaryValue label="P50 latency">
                {formatMilliseconds(model.productionP50Ms)}
              </SummaryValue>
              <SummaryValue label="P95 latency">
                {formatMilliseconds(model.productionP95Ms)}
              </SummaryValue>
              <SummaryValue label="P99 latency">
                {formatMilliseconds(model.productionP99Ms)}
              </SummaryValue>
            </div>
          </div>
          <DataTable
            data={{ columns: PRODUCTION_COLUMNS, rows: model.production }}
            config={{
              emptyText: "This service did not produce Kafka messages in this time range.",
            }}
          />
        </Panel>

        <Panel title="Consumption metrics" description={`Consumer groups running in ${service}`}>
          <DataTable
            data={{ columns: CONSUMPTION_COLUMNS, rows: model.consumption }}
            config={{
              emptyText: "This service did not consume Kafka messages in this time range.",
            }}
          />
        </Panel>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Panel title="Topics" description="Topics connected to the selected service">
          <DataTable
            data={{ columns: TOPIC_COLUMNS, rows: [...topology.topics] }}
            config={{ emptyText: "No topics found." }}
          />
        </Panel>

        <Panel title="Consumer groups" description="Consumption pathways connected to these topics">
          <DataTable
            data={{ columns: GROUP_COLUMNS, rows: model.consumerGroups }}
            config={{ emptyText: "No consumer groups found." }}
          />
        </Panel>
      </div>
    </div>
  );
}
