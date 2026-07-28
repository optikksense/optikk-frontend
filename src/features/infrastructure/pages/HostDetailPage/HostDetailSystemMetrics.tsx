import { type HostMetricGroup, hostSeriesEndpoint } from "../../api/hostDetailApi";
import type { ChartDef } from "../../components/SeriesChartCard";
import { DetailMetricsSection } from "../../components/detail/DetailMetricsSection";

interface HostDetailSystemMetricsProps {
  readonly host: string;
  readonly availableMetrics: readonly string[] | null;
}

const SYSTEM_CHARTS: readonly ChartDef<HostMetricGroup>[] = [
  { group: "cpu", title: "CPU utilization", label: "CPU %", format: "percentage" },
  { group: "load", title: "Load average", label: "Load", format: "number" },
  { group: "memory", title: "Memory usage", label: "Bytes", format: "bytes" },
  { group: "filesystem", title: "Filesystem usage", label: "Used %", format: "percentage" },
  { group: "disk_io", title: "Disk I/O", label: "Bytes/s", format: "bytes" },
];

export function HostDetailSystemMetrics({ host, availableMetrics }: HostDetailSystemMetricsProps) {
  return (
    <DetailMetricsSection
      title="System metrics"
      charts={SYSTEM_CHARTS}
      availableMetrics={availableMetrics}
      endpoint={hostSeriesEndpoint(host)}
      queryKeyPrefix={`host-detail.series.${host}`}
      emptyLabel="no system metrics reported"
      emptyState={
        <>
          This host is not reporting system metrics in the selected range.
          <br />
          Enable the OpenTelemetry <code className="rounded bg-muted px-1">hostmetrics</code>{" "}
          receiver on its collector to populate CPU, memory, disk and network charts.
        </>
      }
    />
  );
}
