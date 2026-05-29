import { ConsumerLagChart } from "../charts/ConsumerLagChart";
import { PartitionLagTable } from "../tables/PartitionLagTable";

export default function LagTab() {
  return (
    <div className="flex flex-col gap-4">
      <ConsumerLagChart />
      <PartitionLagTable />
    </div>
  );
}
