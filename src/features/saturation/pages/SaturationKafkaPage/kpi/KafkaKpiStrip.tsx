import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";

import type { KafkaSummary } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaConsumerLagSeries } from "../hooks/useKafkaConsumerLagSeries";
import { useKafkaThroughputSeries } from "../hooks/useKafkaThroughputSeries";

function lastValue(values: readonly number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

function lagTone(lag: number): KpiTone {
  if (lag >= 10000) return "err";
  if (lag >= 1000) return "warn";
  return "ok";
}

interface KafkaKpiStripProps {
  readonly summary: KafkaSummary | undefined;
}

export function KafkaKpiStrip({ summary }: KafkaKpiStripProps) {
  const { series: throughput } = useKafkaThroughputSeries();
  const { series: lag } = useKafkaConsumerLagSeries();
  const msgsIn = lastValue(throughput.produce);
  const msgsOut = lastValue(throughput.consume);
  const lastLag = lastValue(lag.totalLag);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
        label="Total lag"
        value={fmtNum(lastLag)}
        secondary="msgs"
        subtext="sum across consumer groups"
        tone={lagTone(lastLag)}
      />
    </div>
  );
}
