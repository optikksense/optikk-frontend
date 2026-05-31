import { PageShell } from "@shared/components/ui";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { ThroughputChart } from "./charts/ThroughputChart";
import { BrokerCpuGrid } from "./components/BrokerCpuGrid";
import { KafkaPageHeader } from "./header/KafkaPageHeader";
import { useKafkaConsumerLagSeries } from "./hooks/useKafkaConsumerLagSeries";
import { useKafkaSummary } from "./hooks/useKafkaSummary";
import { KafkaKpiStrip } from "./kpi/KafkaKpiStrip";
import { ConsumerGroupsTable } from "./tables/ConsumerGroupsTable";
import { TopicsTable } from "./tables/TopicsTable";

const LAG_DEGRADED_THRESHOLD = 1000;

function lastValue(values: readonly number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

export default function SaturationKafkaPage() {
  const summaryQ = useKafkaSummary();
  const { series: lagSeries } = useKafkaConsumerLagSeries();

  const lastLag = lastValue(lagSeries.totalLag);
  const degraded =
    lastLag >= LAG_DEGRADED_THRESHOLD
      ? { label: `degraded · ${Math.round(lastLag).toLocaleString()} msgs lag` }
      : null;

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <KafkaPageHeader summary={summaryQ.data} degraded={degraded} />
        <SaturationSubnav active="kafka" counts={{ kafka: summaryQ.data?.topic_count }} />
        <KafkaKpiStrip summary={summaryQ.data} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <BrokerCpuGrid />
            <ThroughputChart />
          </div>
          <ConsumerGroupsTable />
        </div>
        <TopicsTable />
      </div>
    </PageShell>
  );
}
