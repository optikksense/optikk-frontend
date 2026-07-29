import { type HostMetricGroup, hostSeriesEndpoint } from "../../api/hostDetailApi";
import type { ChartDef } from "../../components/SeriesChartCard";
import { DetailMetricsSection } from "../../components/detail/DetailMetricsSection";

interface HostDetailNetworkProps {
  readonly host: string;

  readonly availableMetrics: readonly string[] | null;
}

const NETWORK_CHARTS: readonly ChartDef<HostMetricGroup>[] = [
  { group: "network_io", title: "Network traffic", label: "Bytes/s", format: "bytes" },
  {
    group: "network_errors",
    title: "Network errors & drops",
    label: "Per second",
    format: "number",
  },
];

export function HostDetailNetwork({ host, availableMetrics }: HostDetailNetworkProps) {
  return (
    <DetailMetricsSection
      title="Network"
      charts={NETWORK_CHARTS}
      availableMetrics={availableMetrics}
      endpoint={hostSeriesEndpoint(host)}
      queryKeyPrefix={`host-detail.series.${host}`}
      subtitle="throughput, errors and drops per interface and direction"
    />
  );
}
