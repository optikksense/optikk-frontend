import { PageShell } from "@shared/components/ui";

import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";

import { KafkaDataStreams } from "./datastreams/KafkaDataStreams";
import { KafkaPageHeader } from "./header/KafkaPageHeader";
import { useKafkaSummary } from "./hooks/useKafkaSummary";

export default function SaturationKafkaPage() {
  const summaryQ = useKafkaSummary();

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <KafkaPageHeader summary={summaryQ.data} degraded={null} />
        <SaturationSubnav active="kafka" counts={{ kafka: summaryQ.data?.topic_count }} />
        <KafkaDataStreams />
      </div>
    </PageShell>
  );
}
