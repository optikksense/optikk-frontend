import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";
import { formatBytes } from "@shared/utils/formatters";

import type { KafkaSummary } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaThroughputSeries } from "../hooks/useKafkaThroughputSeries";

function lastValue(values: readonly number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

interface KafkaKpiStripProps {
  readonly summary: KafkaSummary | undefined;
}

// Design's data-backed tiles only (msgs in/out, bytes/s). Under-replicated,
// offline partitions and disk used have no backend source and are omitted.
export function KafkaKpiStrip({ summary }: KafkaKpiStripProps) {
  const { series: throughput } = useKafkaThroughputSeries();
  const msgsIn = lastValue(throughput.produce);
  const msgsOut = lastValue(throughput.consume);
  const bytesPerSec = summary?.bytes_per_sec ?? 0;
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
        label="Bytes /s"
        value={formatBytes(bytesPerSec)}
        secondary="throughput"
        subtext="cluster total"
      />
    </div>
  );
}
