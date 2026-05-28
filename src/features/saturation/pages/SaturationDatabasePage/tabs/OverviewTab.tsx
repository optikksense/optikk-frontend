import { LatencyPercentilesChart } from "../charts/LatencyPercentilesChart";
import { QpsChart } from "../charts/QpsChart";

export default function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <QpsChart />
      <LatencyPercentilesChart />
    </div>
  );
}
