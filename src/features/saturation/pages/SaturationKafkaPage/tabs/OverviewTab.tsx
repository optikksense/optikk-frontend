import { ConsumerLagChart } from "../charts/ConsumerLagChart";
import { PublishErrorsChart } from "../charts/PublishErrorsChart";
import { PublishReceiveLatencyChart } from "../charts/PublishReceiveLatencyChart";
import { ThroughputChart } from "../charts/ThroughputChart";

export default function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ThroughputChart />
      <ConsumerLagChart />
      <PublishReceiveLatencyChart />
      <PublishErrorsChart />
    </div>
  );
}
