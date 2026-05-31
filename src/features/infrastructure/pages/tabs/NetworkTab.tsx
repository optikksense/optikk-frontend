import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";

export default function NetworkTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card padding="md" className="min-h-[300px] border-border">
        <InfraMultiSeriesChart
          queryKey="infra-net-avg"
          endpoint="/v1/infrastructure/network/avg"
          title="Network — fleet avg"
          groupByField="host"
          valueField="value"
          formatType="bytes"
        />
      </Card>
      <Card padding="md" className="min-h-[300px] border-border">
        <InfraMultiSeriesChart
          queryKey="infra-net-by-instance"
          endpoint="/v1/infrastructure/network/by-instance"
          title="Network — by host"
          groupByField="host"
          valueField="value"
          formatType="bytes"
        />
      </Card>
    </div>
  );
}
