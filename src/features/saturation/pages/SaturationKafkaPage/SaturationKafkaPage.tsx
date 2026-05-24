import { PageShell } from "@shared/components/ui";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { ConsumerLagChart } from "./charts/ConsumerLagChart";
import { ThroughputChart } from "./charts/ThroughputChart";
import { KafkaPageHeader } from "./header/KafkaPageHeader";
import { useKafkaSummary } from "./hooks/useKafkaSummary";
import { KafkaKpiStrip } from "./kpi/KafkaKpiStrip";
import { ConsumerGroupsTable } from "./tables/ConsumerGroupsTable";
import { TopicsTable } from "./tables/TopicsTable";

export default function SaturationKafkaPage() {
  const summaryQ = useKafkaSummary();
  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <KafkaPageHeader summary={summaryQ.data} />
        <SaturationSubnav active="kafka" counts={{ kafka: summaryQ.data?.topic_count }} />
        <KafkaKpiStrip summary={summaryQ.data} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ThroughputChart />
          <ConsumerLagChart />
        </div>
        <TopicsTable />
        <ConsumerGroupsTable />
      </div>
    </PageShell>
  );
}
