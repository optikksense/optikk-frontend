import type { KafkaSummary } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { KpiCard } from "@/features/services/pages/ServiceDetailPage/kpi/KpiCard";

import { useKafkaThroughputSeries } from "../hooks/useKafkaThroughputSeries";

function lastValue(values: number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

interface KafkaKpiStripProps {
  readonly summary: KafkaSummary | undefined;
}

export function KafkaKpiStrip({ summary }: KafkaKpiStripProps) {
  const { series } = useKafkaThroughputSeries();
  const msgsIn = lastValue(series.produce);
  const msgsOut = lastValue(series.consume);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <KpiCard
        label="Msgs in /s"
        value={fmtNum(msgsIn)}
        secondary="produce rate"
        subtext={`across ${summary ? summary.topic_count : "—"} topics`}
      />
      <KpiCard
        label="Msgs out /s"
        value={fmtNum(msgsOut)}
        secondary="consume rate"
        subtext={`across ${summary ? summary.group_count : "—"} groups`}
      />
      <KpiCard
        label="Partitions"
        value={summary ? fmtNum(summary.assigned_partitions) : "—"}
        subtext="assigned"
      />
    </div>
  );
}
