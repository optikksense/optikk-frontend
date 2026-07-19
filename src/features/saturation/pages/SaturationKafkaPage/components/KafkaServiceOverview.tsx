import { type ReactNode, useMemo } from "react";

import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";
import { cn } from "@shared/lib/utils";

import {
  buildKafkaPageModel,
  formatMilliseconds,
  formatPercent,
  formatRate,
  healthFromError,
} from "../kafkaPageModel";
import { KafkaTopologyGraph } from "./KafkaTopologyGraph";

const TH = "px-3 py-2 text-left font-medium text-[11px] text-foreground-muted";
const TD = "border-border border-t px-3 py-2.5 text-[12px] text-foreground";

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

function EmptyRows({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-24 place-items-center px-4 text-[12px] text-foreground-muted">
      {children}
    </div>
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
          {model.production.length === 0 ? (
            <EmptyRows>This service did not produce Kafka messages in this time range.</EmptyRows>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={TH}>Topic</th>
                    <th className={`${TH} text-right`}>Messages/sec</th>
                    <th className={`${TH} text-right`}>Producers</th>
                    <th className={`${TH} text-right`}>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {model.production.map((row) => (
                    <tr key={row.topic}>
                      <td className={`${TD} font-medium font-mono`}>{row.topic}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatRate(row.rate)}</td>
                      <td className={`${TD} text-right tabular-nums`}>{row.producerCount}</td>
                      <td className={`${TD} text-right tabular-nums`}>{row.consumerGroupCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Consumption metrics" description={`Consumer groups running in ${service}`}>
          {model.consumption.length === 0 ? (
            <EmptyRows>This service did not consume Kafka messages in this time range.</EmptyRows>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={TH}>Consumer group</th>
                    <th className={TH}>Topics</th>
                    <th className={`${TH} text-right`}>Messages/sec</th>
                    <th className={`${TH} text-right`}>P50</th>
                    <th className={`${TH} text-right`}>P95</th>
                    <th className={`${TH} text-right`}>P99</th>
                    <th className={`${TH} text-right`}>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {model.consumption.map((row) => (
                    <tr key={row.group}>
                      <td className={`${TD} font-medium font-mono`}>{row.group}</td>
                      <td
                        className={`${TD} max-w-48 truncate text-foreground-muted`}
                        title={row.topics.join(", ")}
                      >
                        {row.topics.join(", ") || "—"}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>{formatRate(row.rate)}</td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {formatMilliseconds(row.p50Ms)}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {formatMilliseconds(row.p95Ms)}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {formatMilliseconds(row.p99Ms)}
                      </td>
                      <td className={`${TD} text-right`}>
                        <ErrorRate value={row.errorRate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Panel title="Topics" description="Topics connected to the selected service">
          {topology.topics.length === 0 ? (
            <EmptyRows>No topics found.</EmptyRows>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={TH}>Topic</th>
                    <th className={`${TH} text-right`}>Messages/sec</th>
                    <th className={`${TH} text-right`}>Producers</th>
                    <th className={`${TH} text-right`}>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {topology.topics.map((topic) => (
                    <tr key={topic.topic}>
                      <td className={`${TD} font-medium font-mono`}>{topic.topic}</td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {formatRate(topic.rate_per_sec)}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>{topic.producer_count}</td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {topic.consumer_group_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Consumer groups" description="Consumption pathways connected to these topics">
          {model.consumerGroups.length === 0 ? (
            <EmptyRows>No consumer groups found.</EmptyRows>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={TH}>Group</th>
                    <th className={TH}>Consumer</th>
                    <th className={TH}>Topic</th>
                    <th className={`${TH} text-right`}>Messages/sec</th>
                    <th className={`${TH} text-right`}>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {model.consumerGroups.map((row) => (
                    <tr key={`${row.group}-${row.consumer}-${row.topic}`}>
                      <td className={`${TD} font-medium font-mono`}>{row.group}</td>
                      <td className={`${TD} font-mono text-foreground-muted`}>{row.consumer}</td>
                      <td className={`${TD} font-mono text-foreground-muted`}>{row.topic}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatRate(row.rate)}</td>
                      <td className={`${TD} text-right`}>
                        <ErrorRate value={row.errorRate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
