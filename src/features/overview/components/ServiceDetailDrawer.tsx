import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, GitBranch, Server } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  type OverviewErrorRatePoint,
  type OverviewP95LatencyPoint,
  type OverviewRequestRatePoint,
  metricsOverviewApi,
} from "@/features/metrics/api/metricsOverviewApi";
import {
  type ServiceTopologyEdge,
  fetchServiceTopology,
} from "@/features/overview/pages/ServiceHubPage/topology/api";
import { ROUTES } from "@/shared/constants/routes";
import { Badge, Card } from "@shared/components/primitives/ui";
import StatCard from "@shared/components/ui/cards/StatCard";
import ErrorRateChart from "@shared/components/ui/charts/time-series/ErrorRateChart";
import LatencyChart from "@shared/components/ui/charts/time-series/LatencyChart";
import RequestChart from "@shared/components/ui/charts/time-series/RequestChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { buildServiceLogsSearch, buildServiceTracesSearch } from "./serviceDrawerState";

interface ServiceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

interface DrawerSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

interface TrendPanelProps {
  title: string;
  subtitle: string;
  headline: string;
  tone?: "requests" | "errors" | "latency";
  children: React.ReactNode;
}

interface Column<Row> {
  key: string;
  label: string;
  render: (row: Row) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface ServiceSummarySnapshot {
  requestCount: number;
  errorCount: number;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
}

interface DependencyRow {
  id: string;
  serviceName: string;
  callCount: number;
  p95LatencyMs: number;
}

interface EndpointRow {
  id: string;
  service_name: string;
  operation_name: string;
  endpoint_name?: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p95_latency: number;
}

function DrawerSection({ title, subtitle, children }: DrawerSectionProps) {
  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-[14px] text-[var(--text-primary)]">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TrendPanel({ title, subtitle, headline, tone = "requests", children }: TrendPanelProps) {
  const toneClasses =
    tone === "errors"
      ? "border-[rgba(240,68,56,0.16)] bg-[linear-gradient(180deg,rgba(240,68,56,0.07),rgba(240,68,56,0.02))]"
      : tone === "latency"
        ? "border-[rgba(245,158,11,0.16)] bg-[linear-gradient(180deg,rgba(245,158,11,0.07),rgba(245,158,11,0.02))]"
        : "border-[rgba(94,96,206,0.16)] bg-[linear-gradient(180deg,rgba(94,96,206,0.07),rgba(94,96,206,0.02))]";

  return (
    <section
      className={`rounded-[calc(var(--card-radius)+2px)] border p-5 shadow-[var(--shadow-sm)] ${toneClasses}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{title}</h3>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-5">{subtitle}</p>
        </div>
        <div className="rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] px-3 py-1 font-semibold text-[12px] text-[var(--text-primary)] tracking-[0.02em]">
          {headline}
        </div>
      </div>
      <div className="mt-5 min-h-[280px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(15,18,25,0.35)] p-3">
        {children}
      </div>
    </section>
  );
}

function CompactTable<Row extends { id: string }>({
  columns,
  emptyText,
  rows,
}: {
  columns: readonly Column<Row>[];
  emptyText: string;
  rows: readonly Row[];
}) {
  if (rows.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">{emptyText}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-2 py-2 font-medium"
                style={{ textAlign: column.align ?? "left" }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-[var(--border-color)] border-b last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-2 py-2 text-[var(--text-primary)]"
                  style={{ textAlign: column.align ?? "left" }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeServiceKey(value: string): string {
  return value.trim().toLowerCase();
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildInitialSummary(
  data: Record<string, unknown> | null | undefined
): ServiceSummarySnapshot | null {
  if (!data) {
    return null;
  }

  const requestCount = readNumber(data.request_count) ?? 0;
  const errorCount = readNumber(data.error_count) ?? 0;
  const explicitErrorRate = readNumber(data.error_rate);

  return {
    requestCount,
    errorCount,
    errorRate: explicitErrorRate ?? (requestCount > 0 ? (errorCount * 100) / requestCount : 0),
    avgLatency: readNumber(data.avg_latency) ?? 0,
    p95Latency: readNumber(data.p95_latency) ?? 0,
    p99Latency: readNumber(data.p99_latency) ?? 0,
  };
}

function buildDependencyRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string,
  direction: "upstream" | "downstream"
): DependencyRow[] {
  const normalizedServiceName = normalizeServiceKey(serviceName);

  return edges
    .filter((edge) =>
      direction === "upstream"
        ? normalizeServiceKey(edge.target) === normalizedServiceName
        : normalizeServiceKey(edge.source) === normalizedServiceName
    )
    .sort((left, right) => Number(right.call_count ?? 0) - Number(left.call_count ?? 0))
    .slice(0, 6)
    .map((edge) => ({
      id: `${direction}:${edge.source}->${edge.target}`,
      serviceName: direction === "upstream" ? edge.source : edge.target,
      callCount: Number(edge.call_count ?? 0),
      p95LatencyMs: Number(edge.p95_latency_ms ?? 0),
    }));
}

function buildLatencyTrendSeries(points: readonly OverviewP95LatencyPoint[]) {
  return points.map((point) => ({
    timestamp: point.timestamp,
    p95: point.p95,
  }));
}

function buildRequestTrendSeries(points: readonly OverviewRequestRatePoint[]) {
  return points.map((point) => ({
    timestamp: point.timestamp,
    request_count: point.requestCount,
  }));
}

function buildErrorTrendSeries(points: readonly OverviewErrorRatePoint[]) {
  return points.map((point) => ({
    timestamp: point.timestamp,
    request_count: point.requestCount,
    error_count: point.errorCount,
    error_rate: point.errorRate,
  }));
}

function healthVariantForErrorRate(errorRate: number | undefined): "success" | "warning" | "error" {
  const rate = Number(errorRate ?? 0);
  if (rate > 5) return "error";
  if (rate > 1) return "warning";
  return "success";
}

function healthLabelForErrorRate(errorRate: number | undefined): string {
  const rate = Number(errorRate ?? 0);
  if (rate > 5) return "unhealthy";
  if (rate > 1) return "degraded";
  return "healthy";
}

function formatEndpointLabel(row: Pick<EndpointRow, "endpoint_name" | "operation_name">): string {
  const endpointName = row.endpoint_name?.trim();
  const operationName = row.operation_name.trim();

  if (endpointName) {
    return endpointName;
  }

  if (operationName && !operationName.startsWith("/")) {
    return operationName;
  }

  return operationName || "Route unavailable";
}

function formatEndpointMeta(
  row: Pick<EndpointRow, "endpoint_name" | "operation_name">
): string | null {
  const endpointName = row.endpoint_name?.trim();
  const operationName = row.operation_name.trim();

  if (endpointName && operationName && endpointName !== operationName) {
    return `Span: ${operationName}`;
  }

  if (!endpointName && operationName) {
    return operationName === formatEndpointLabel(row)
      ? "Route label unavailable in spans"
      : `Span: ${operationName}`;
  }

  return null;
}

export default function ServiceDetailDrawer({
  open,
  onClose,
  serviceName,
  title,
  initialData,
}: ServiceDetailDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedServiceName = normalizeServiceKey(serviceName);

  const metricsQuery = useTimeRangeQuery(
    "service-drawer-metrics",
    async (teamId, startTime, endTime) =>
      metricsOverviewApi.getOverviewServiceMetrics(teamId, startTime, endTime),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const requestTrendQuery = useTimeRangeQuery(
    "service-drawer-request-trend",
    async (teamId, startTime, endTime) =>
      metricsOverviewApi.getOverviewRequestRate(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const errorTrendQuery = useTimeRangeQuery(
    "service-drawer-error-trend",
    async (teamId, startTime, endTime) =>
      metricsOverviewApi.getOverviewErrorRate(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const latencyTrendQuery = useTimeRangeQuery(
    "service-drawer-latency-trend",
    async (teamId, startTime, endTime) =>
      metricsOverviewApi.getOverviewP95Latency(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const endpointsQuery = useTimeRangeQuery(
    "service-drawer-endpoints",
    async (teamId, startTime, endTime) =>
      metricsOverviewApi.getOverviewEndpointMetrics(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const dependenciesQuery = useTimeRangeQuery(
    "service-drawer-dependencies",
    async (_teamId, startTime, endTime) =>
      fetchServiceTopology({ startTime, endTime, service: serviceName }),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );

  const initialSummary = useMemo(() => buildInitialSummary(initialData), [initialData]);

  const selectedServiceMetrics = useMemo(
    () =>
      metricsQuery.data?.find(
        (entry) => normalizeServiceKey(entry.service_name) === normalizedServiceName
      ) ?? null,
    [metricsQuery.data, normalizedServiceName]
  );

  const summaryMetrics = useMemo<ServiceSummarySnapshot | null>(() => {
    if (selectedServiceMetrics) {
      return {
        requestCount: selectedServiceMetrics.request_count ?? 0,
        errorCount: selectedServiceMetrics.error_count ?? 0,
        errorRate:
          Number(selectedServiceMetrics.request_count ?? 0) > 0
            ? (Number(selectedServiceMetrics.error_count ?? 0) * 100) /
              Number(selectedServiceMetrics.request_count ?? 0)
            : 0,
        avgLatency: selectedServiceMetrics.avg_latency ?? 0,
        p95Latency: selectedServiceMetrics.p95_latency ?? 0,
        p99Latency: selectedServiceMetrics.p99_latency ?? 0,
      };
    }

    return initialSummary;
  }, [initialSummary, selectedServiceMetrics]);

  const requestTrendSeries = useMemo(
    () => buildRequestTrendSeries(requestTrendQuery.data ?? []),
    [requestTrendQuery.data]
  );

  const errorTrendSeries = useMemo(
    () => buildErrorTrendSeries(errorTrendQuery.data ?? []),
    [errorTrendQuery.data]
  );

  const latencyTrendSeries = useMemo(
    () => buildLatencyTrendSeries(latencyTrendQuery.data ?? []),
    [latencyTrendQuery.data]
  );

  const endpointRows = useMemo(
    () =>
      [...(endpointsQuery.data ?? [])]
        .sort((left, right) => Number(right.request_count ?? 0) - Number(left.request_count ?? 0))
        .slice(0, 6)
        .map((row, index) => ({
          ...row,
          id: `${row.http_method}:${row.operation_name}:${index}`,
        })),
    [endpointsQuery.data]
  );

  const upstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "upstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const downstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "downstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const requestSparkline = useMemo(
    () => requestTrendSeries.map((point) => Number(point.request_count ?? 0)),
    [requestTrendSeries]
  );

  const errorSparkline = useMemo(
    () =>
      errorTrendSeries.map((point) => {
        const requests = Number(point.request_count ?? 0);
        const errors = Number(point.error_count ?? 0);
        return requests > 0 ? (errors * 100) / requests : 0;
      }),
    [errorTrendSeries]
  );

  const latencySparkline = useMemo(
    () => latencyTrendSeries.map((point) => Number(point.p95 ?? 0)),
    [latencyTrendSeries]
  );

  const openTraces = (): void => {
    navigate({
      to: ROUTES.traces,
      search: buildServiceTracesSearch(location.search, serviceName) as any,
    });
  };

  const openLogs = (): void => {
    navigate({
      to: ROUTES.logs,
      search: buildServiceLogsSearch(location.search, serviceName) as any,
    });
  };

  const serviceLabel = title?.trim() || serviceName;
  const hasSummary = Boolean(summaryMetrics);
  const summaryLoading = metricsQuery.isLoading && !summaryMetrics;
  const requestTrendLoading = requestTrendQuery.isLoading && requestTrendSeries.length === 0;
  const errorTrendLoading = errorTrendQuery.isLoading && errorTrendSeries.length === 0;
  const latencyTrendLoading = latencyTrendQuery.isLoading && latencyTrendSeries.length === 0;
  const endpointsLoading = endpointsQuery.isLoading && endpointRows.length === 0;
  const dependenciesLoading =
    dependenciesQuery.isLoading && upstreamRows.length === 0 && downstreamRows.length === 0;

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      direction="right"
    >
      <DrawerContent
        className="top-[var(--space-header-h,56px)] right-0 bottom-0 left-auto z-[1100] h-auto select-text overflow-y-auto border-[var(--border-color)] border-l"
        style={{
          width: "min(980px, calc(100vw - 24px))",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
      >
        <DrawerHeader className="items-start">
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Server size={18} className="shrink-0" />
                  <span className="truncate">{serviceLabel || "Service"}</span>
                </DrawerTitle>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                  Frontend-owned service detail drawer with quick diagnostics and workflow links.
                </p>
              </div>
              <DrawerClose
                aria-label="Close"
                className="shrink-0 rounded-[var(--card-radius)] border border-[var(--border-color)] px-3 py-1 text-[18px] text-[var(--text-secondary)] leading-none transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                &times;
              </DrawerClose>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {summaryMetrics ? (
                <>
                  <Badge variant={healthVariantForErrorRate(summaryMetrics.errorRate)}>
                    {healthLabelForErrorRate(summaryMetrics.errorRate)}
                  </Badge>
                  <Badge variant="default">{formatNumber(summaryMetrics.requestCount)} req</Badge>
                  <Badge variant="default">
                    {formatPercentage(summaryMetrics.errorRate)} error
                  </Badge>
                  <Badge variant="default">{formatDuration(summaryMetrics.p95Latency)} p95</Badge>
                </>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                icon={<GitBranch size={14} />}
                onClick={openTraces}
              >
                Open in Traces
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowUpRight size={14} />}
                onClick={openLogs}
              >
                Open in Logs
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { href: "#service-drawer-overview", label: "Overview" },
                { href: "#service-drawer-endpoints", label: "Endpoints" },
                { href: "#service-drawer-dependencies", label: "Dependencies" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1 text-[11px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          <Card
            padding="lg"
            className="border-[rgba(124,127,242,0.18)] bg-[linear-gradient(180deg,rgba(124,127,242,0.1),rgba(124,127,242,0.03))]"
          >
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">
                  Service cockpit
                </div>
                <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
                  Runtime health, tail latency, and dependency posture for {serviceLabel}.
                </div>
                <p className="mt-2 text-[12px] text-[var(--text-secondary)] leading-6">
                  Use this drawer for fast diagnostics, then jump into traces or logs for the exact
                  window you want to investigate.
                </p>
              </div>
              {summaryMetrics ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                      Requests
                    </div>
                    <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                      {formatNumber(summaryMetrics.requestCount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                      Errors
                    </div>
                    <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                      {formatPercentage(summaryMetrics.errorRate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                      P95
                    </div>
                    <div className="mt-1 font-semibold text-[18px] text-[var(--text-primary)]">
                      {formatDuration(summaryMetrics.p95Latency)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <div id="service-drawer-overview" className="scroll-mt-24">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                metric={{
                  title: "Requests",
                  value: summaryMetrics?.requestCount ?? 0,
                  formatter: formatNumber,
                }}
                visuals={{ sparklineData: requestSparkline, loading: summaryLoading }}
              />
              <StatCard
                metric={{
                  title: "Error Rate",
                  value: summaryMetrics?.errorRate ?? 0,
                  formatter: (value) => formatPercentage(Number(value)),
                }}
                visuals={{ sparklineData: errorSparkline, loading: summaryLoading }}
              />
              <StatCard
                metric={{
                  title: "Avg Latency",
                  value: summaryMetrics?.avgLatency ?? 0,
                  formatter: formatDuration,
                }}
                visuals={{ sparklineData: latencySparkline, loading: summaryLoading }}
              />
              <StatCard
                metric={{
                  title: "P95 Latency",
                  value: summaryMetrics?.p95Latency ?? 0,
                  formatter: formatDuration,
                }}
                visuals={{ sparklineData: latencySparkline, loading: summaryLoading }}
              />
            </div>
          </div>

          {metricsQuery.isError && !hasSummary ? (
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-[12px] text-[var(--text-muted)]">
              Service summary is unavailable right now. You can still open Logs or Traces for this
              service.
            </div>
          ) : null}

          {!metricsQuery.isError && !summaryLoading && !hasSummary ? (
            <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-[12px] text-[var(--text-muted)]">
              No service metrics were found for this service in the current time range.
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <TrendPanel
              title="Request Trend"
              subtitle="Request volume over the active time range, with enough room to spot ramps, plateaus, and drops at a glance."
              headline={formatNumber(summaryMetrics?.requestCount ?? 0)}
              tone="requests"
            >
              {requestTrendQuery.isError ? (
                <div className="text-[12px] text-[var(--text-muted)]">
                  Request trend is unavailable.
                </div>
              ) : requestTrendLoading ? (
                <div className="text-[12px] text-[var(--text-muted)]">Loading request trend…</div>
              ) : requestTrendSeries.length > 0 ? (
                <RequestChart data={requestTrendSeries} valueKey="request_count" height={260} />
              ) : (
                <div className="text-[12px] text-[var(--text-muted)]">No request trend data.</div>
              )}
            </TrendPanel>

            <TrendPanel
              title="Error Trend"
              subtitle="Error rate over time for this service, sized for reading spikes and recovery windows instead of just confirming the chart exists."
              headline={formatPercentage(summaryMetrics?.errorRate ?? 0)}
              tone="errors"
            >
              {errorTrendQuery.isError ? (
                <div className="text-[12px] text-[var(--text-muted)]">
                  Error trend is unavailable.
                </div>
              ) : errorTrendLoading ? (
                <div className="text-[12px] text-[var(--text-muted)]">Loading error trend…</div>
              ) : errorTrendSeries.length > 0 ? (
                <ErrorRateChart data={errorTrendSeries} height={260} />
              ) : (
                <div className="text-[12px] text-[var(--text-muted)]">No error trend data.</div>
              )}
            </TrendPanel>

            <TrendPanel
              title="Latency Trend"
              subtitle="P95 latency over the active time range, with a taller chart so tail-latency bursts are easier to read."
              headline={formatDuration(summaryMetrics?.p95Latency ?? 0)}
              tone="latency"
            >
              {latencyTrendQuery.isError ? (
                <div className="text-[12px] text-[var(--text-muted)]">
                  Latency trend is unavailable.
                </div>
              ) : latencyTrendLoading ? (
                <div className="text-[12px] text-[var(--text-muted)]">Loading latency trend…</div>
              ) : latencyTrendSeries.length > 0 ? (
                <LatencyChart data={latencyTrendSeries} valueKey="p95" height={260} />
              ) : (
                <div className="text-[12px] text-[var(--text-muted)]">No latency trend data.</div>
              )}
            </TrendPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div id="service-drawer-endpoints" className="scroll-mt-24">
              <DrawerSection
                title="Top Endpoints"
                subtitle="Most active endpoints for this service in the current window."
              >
                {endpointsQuery.isError ? (
                  <div className="text-[12px] text-[var(--text-muted)]">
                    Endpoint breakdown is unavailable.
                  </div>
                ) : endpointsLoading ? (
                  <div className="text-[12px] text-[var(--text-muted)]">Loading endpoints…</div>
                ) : (
                  <CompactTable<EndpointRow & { id: string }>
                    rows={endpointRows}
                    emptyText="No endpoint activity for this service."
                    columns={[
                      {
                        key: "method",
                        label: "Method",
                        render: (row) => (
                          <span className="font-medium text-[var(--text-secondary)]">
                            {row.http_method || "—"}
                          </span>
                        ),
                      },
                      {
                        key: "operation",
                        label: "Endpoint Detail",
                        render: (row) => (
                          <div className="flex flex-col gap-0.5">
                            <span className="break-all">{formatEndpointLabel(row)}</span>
                            {formatEndpointMeta(row) ? (
                              <span className="text-[11px] text-[var(--text-muted)]">
                                {formatEndpointMeta(row)}
                              </span>
                            ) : null}
                          </div>
                        ),
                      },
                      {
                        key: "requests",
                        label: "Requests",
                        align: "right",
                        render: (row) => formatNumber(row.request_count),
                      },
                      {
                        key: "errors",
                        label: "Err %",
                        align: "right",
                        render: (row) =>
                          formatPercentage(
                            Number(row.request_count ?? 0) > 0
                              ? (Number(row.error_count ?? 0) * 100) /
                                  Number(row.request_count ?? 0)
                              : 0
                          ),
                      },
                      {
                        key: "avg",
                        label: "Avg",
                        align: "right",
                        render: (row) => formatDuration(row.avg_latency),
                      },
                      {
                        key: "latency",
                        label: "p95",
                        align: "right",
                        render: (row) => formatDuration(row.p95_latency),
                      },
                    ]}
                  />
                )}
              </DrawerSection>
            </div>

            <div id="service-drawer-dependencies" className="scroll-mt-24">
              <DrawerSection
                title="Dependencies"
                subtitle="Top upstream and downstream relationships for this service."
              >
                {dependenciesQuery.isError ? (
                  <div className="text-[12px] text-[var(--text-muted)]">
                    Dependency map is unavailable.
                  </div>
                ) : dependenciesLoading ? (
                  <div className="text-[12px] text-[var(--text-muted)]">Loading dependencies…</div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-2 font-medium text-[12px] text-[var(--text-secondary)]">
                        Upstream
                      </div>
                      <CompactTable
                        rows={upstreamRows}
                        emptyText="No upstream callers in range."
                        columns={[
                          {
                            key: "service",
                            label: "Service",
                            render: (row) => row.serviceName || "Unknown",
                          },
                          {
                            key: "calls",
                            label: "Calls",
                            align: "right",
                            render: (row) => formatNumber(row.callCount),
                          },
                          {
                            key: "latency",
                            label: "p95",
                            align: "right",
                            render: (row) => formatDuration(row.p95LatencyMs),
                          },
                        ]}
                      />
                    </div>
                    <div>
                      <div className="mb-2 font-medium text-[12px] text-[var(--text-secondary)]">
                        Downstream
                      </div>
                      <CompactTable
                        rows={downstreamRows}
                        emptyText="No downstream dependencies in range."
                        columns={[
                          {
                            key: "service",
                            label: "Service",
                            render: (row) => row.serviceName || "Unknown",
                          },
                          {
                            key: "calls",
                            label: "Calls",
                            align: "right",
                            render: (row) => formatNumber(row.callCount),
                          },
                          {
                            key: "latency",
                            label: "p95",
                            align: "right",
                            render: (row) => formatDuration(row.p95LatencyMs),
                          },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </DrawerSection>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
