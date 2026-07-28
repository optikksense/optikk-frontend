import { type HostMetricGroup, hostSeriesEndpoint } from "../../api/hostDetailApi";
import { type ChartDef, SeriesChartCard, availableCharts } from "../../components/SeriesChartCard";

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
  const charts = availableCharts(NETWORK_CHARTS, availableMetrics);
  if (charts.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <header>
        <div className="font-semibold text-[13px] text-foreground">Network</div>
        <div className="text-[11px] text-foreground-muted">
          throughput, errors and drops per interface and direction
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map((def) => (
          <SeriesChartCard
            key={def.group}
            endpoint={hostSeriesEndpoint(host)}
            queryKeyPrefix={`host-detail.series.${host}`}
            def={def}
          />
        ))}
      </div>
    </section>
  );
}
