import { useMemo } from "react";

import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";
import { PanelCard } from "@shared/components/ui/PanelCard";
import DataTable from "@shared/components/ui/data-display/DataTable";

import { buildKafkaPageModel, formatMilliseconds, formatRate } from "../kafkaPageModel";
import { ErrorRate, MetricCard, SummaryValue } from "./KafkaPrimitives";
import { KafkaTopologyGraph } from "./KafkaTopologyGraph";
import { consumptionColumns, groupColumns, productionColumns } from "./kafkaColumns";

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

      <PanelCard
        title={`Topology · ${service}`}
        subtitle="Producers → topics → consumers"
        padded={false}
        className="min-w-0 overflow-hidden"
      >
        <KafkaTopologyGraph topology={topology} onSelectService={onSelectService} />
      </PanelCard>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <PanelCard
          title="Production metrics"
          subtitle={`Messages published by ${service}`}
          padded={false}
          className="min-w-0 overflow-hidden"
        >
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
            data={{ columns: productionColumns, rows: model.production }}
            config={{
              emptyText: "This service did not produce Kafka messages in this time range.",
            }}
          />
        </PanelCard>

        <PanelCard
          title="Consumption metrics"
          subtitle={`Consumer groups running in ${service}`}
          padded={false}
          className="min-w-0 overflow-hidden"
        >
          <DataTable
            data={{ columns: consumptionColumns, rows: model.consumption }}
            config={{
              emptyText: "This service did not consume Kafka messages in this time range.",
            }}
          />
        </PanelCard>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <PanelCard
          title="Topics"
          subtitle="Topics connected to the selected service"
          padded={false}
          className="min-w-0 overflow-hidden"
        >
          <DataTable
            data={{ columns: productionColumns, rows: model.topics }}
            config={{ emptyText: "No topics found." }}
          />
        </PanelCard>

        <PanelCard
          title="Consumer groups"
          subtitle="Consumption pathways connected to these topics"
          padded={false}
          className="min-w-0 overflow-hidden"
        >
          <DataTable
            data={{ columns: groupColumns, rows: model.consumerGroups }}
            config={{ emptyText: "No consumer groups found." }}
          />
        </PanelCard>
      </div>
    </div>
  );
}
