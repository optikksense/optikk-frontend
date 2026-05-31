import { GroupErrorsChart } from "../charts/GroupErrorsChart";
import { ProcessLatencyChart } from "../charts/ProcessLatencyChart";
import { ProcessRateChart } from "../charts/ProcessRateChart";
import { RebalanceChart } from "../charts/RebalanceChart";
import { ConsumerGroupsTable } from "../tables/ConsumerGroupsTable";

export default function ConsumerGroupsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProcessRateChart />
        <ProcessLatencyChart />
        <GroupErrorsChart />
        <RebalanceChart />
      </div>
      <ConsumerGroupsTable />
    </div>
  );
}
