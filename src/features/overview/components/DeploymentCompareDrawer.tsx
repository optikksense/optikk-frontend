import { useLocation, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, GitBranch, GitCompare, Radar } from "lucide-react";
import { useMemo } from "react";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  type DeploymentCompareResponse,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { useAppStore, useRefreshKey, useTeamId } from "@app/store/appStore";
import { CHART_COLORS } from "@config/constants";
import {
  Badge,
  Button,
  Card,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  formatTimestamp,
} from "@shared/utils/formatters";
import { buildServiceLogsSearch, buildServiceTracesSearch } from "./serviceDrawerState";

interface DeploymentCompareDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

interface DeploymentSeed {
  serviceName: string;
  version: string;
  environment: string;
  deployedAtMs: number;
  lastSeenAtMs: number | null;
  isActive: boolean;
}

interface TimelineSeries {
  label: string;
  values: Array<number | null>;
  color: string;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : value === "true";
}

function readTimestampMs(value: unknown): number {
  const raw = readString(value);
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDeploymentSeed(
  initialData: Record<string, unknown> | null | undefined
): DeploymentSeed | null {
  if (!initialData) return null;
  const serviceName = readString(initialData.service_name);
  const version = readString(initialData.version);
  const environment = readString(initialData.environment);
  const deployedAtMs = readTimestampMs(initialData.deployed_at);
  if (!serviceName || !version || deployedAtMs <= 0) {
    return null;
  }

  return {
    serviceName,
    version,
    environment,
    deployedAtMs,
    lastSeenAtMs: (() => {
      const ts = readTimestampMs(initialData.last_seen_at);
      return ts > 0 ? ts : null;
    })(),
    isActive: readBoolean(initialData.is_active),
  };
}

function toneFromDelta(delta: number): "positive" | "negative" | "neutral" {
  if (delta > 0) return "negative";
  if (delta < 0) return "positive";
  return "neutral";
}

function DeltaPill({
  delta,
  formatter,
  invert = false,
}: {
  delta: number;
  formatter: (value: number) => string;
  invert?: boolean;
}) {
  const effective = invert ? delta * -1 : delta;
  const tone = toneFromDelta(effective);
  const classes =
    tone === "negative"
      ? "border-[rgba(240,68,56,0.25)] bg-[rgba(240,68,56,0.12)] text-[var(--color-error)]"
      : tone === "positive"
        ? "border-[rgba(115,201,145,0.25)] bg-[rgba(115,201,145,0.12)] text-[var(--color-success)]"
        : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]";
  const prefix = delta > 0 ? "+" : "";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium text-[11px] ${classes}`}
    >
      {prefix}
      {formatter(delta)}
    </span>
  );
}

function SummaryCard({
  label,
  beforeValue,
  afterValue,
  delta,
  formatter,
  invertDelta = false,
}: {
  label: string;
  beforeValue?: number | null;
  afterValue: number;
  delta: number;
  formatter: (value: number) => string;
  invertDelta?: boolean;
}) {
  return (
    <Card
      padding="lg"
      className="border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className="mt-2 font-semibold text-[22px] text-[var(--text-primary)]">
            {formatter(afterValue)}
          </div>
        </div>
        <DeltaPill delta={delta} formatter={formatter} invert={invertDelta} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <span>Before</span>
        <span className="font-medium text-[var(--text-primary)]">
          {beforeValue == null ? "—" : formatter(beforeValue)}
        </span>
      </div>
    </Card>
  );
}

function buildTimelineSeries(
  compare: DeploymentCompareResponse,
  points: Awaited<ReturnType<typeof deploymentsApi.getVersionTraffic>>
): {
  timestamps: number[];
  series: TimelineSeries[];
} {
  const uniqueTimestamps = Array.from(
    new Set(points.map((point) => new Date(point.timestamp).getTime()).filter(Number.isFinite))
  ).sort((left, right) => left - right);

  const versionMap = new Map<string, Map<number, number>>();
  for (const point of points) {
    const timestampMs = new Date(point.timestamp).getTime();
    if (!Number.isFinite(timestampMs)) continue;
    if (!versionMap.has(point.version)) {
      versionMap.set(point.version, new Map<number, number>());
    }
    versionMap.get(point.version)?.set(timestampMs, point.rps);
  }

  const versions = Array.from(versionMap.keys()).sort((left, right) => {
    if (left === compare.deployment.version) return -1;
    if (right === compare.deployment.version) return 1;
    return left.localeCompare(right);
  });

  return {
    timestamps: uniqueTimestamps.map((timestamp) => timestamp / 1000),
    series: versions.map((version, index) => ({
      label: version,
      values: uniqueTimestamps.map((timestamp) => versionMap.get(version)?.get(timestamp) ?? null),
      color:
        version === compare.deployment.version
          ? "var(--color-primary)"
          : CHART_COLORS[index % CHART_COLORS.length],
    })),
  };
}

function formatWindowLabel(startMs: number, endMs: number): string {
  return `${formatTimestamp(startMs)} to ${formatTimestamp(endMs)}`;
}

export default function DeploymentCompareDrawer({
  open,
  onClose,
  title,
  initialData,
}: DeploymentCompareDrawerProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const setCustomTimeRange = useAppStore((state) => state.setCustomTimeRange);

  const seed = useMemo(() => parseDeploymentSeed(initialData), [initialData]);

  const compareQuery = useStandardQuery({
    queryKey: [
      "deployment-compare",
      teamId,
      refreshKey,
      seed?.serviceName,
      seed?.version,
      seed?.environment,
      seed?.deployedAtMs,
    ],
    queryFn: async () =>
      deploymentsApi.getDeploymentCompare({
        serviceName: seed?.serviceName ?? "",
        version: seed?.version ?? "",
        environment: seed?.environment ?? "",
        deployedAt: seed?.deployedAtMs ?? 0,
      }),
    enabled: Boolean(teamId && seed?.serviceName && seed?.version && seed?.deployedAtMs),
  });

  const timelineQuery = useStandardQuery({
    queryKey: [
      "deployment-compare-timeline",
      teamId,
      refreshKey,
      compareQuery.data?.deployment.service_name,
      compareQuery.data?.timeline_start_ms,
      compareQuery.data?.timeline_end_ms,
    ],
    queryFn: async () =>
      deploymentsApi.getVersionTraffic(
        compareQuery.data?.deployment.service_name ?? "",
        compareQuery.data?.timeline_start_ms ?? 0,
        compareQuery.data?.timeline_end_ms ?? 0
      ),
    enabled: Boolean(
      teamId &&
        compareQuery.data?.deployment.service_name &&
        (compareQuery.data?.timeline_start_ms ?? 0) < (compareQuery.data?.timeline_end_ms ?? 0)
    ),
  });

  const compare = compareQuery.data;
  const summaryBefore = compare?.summary.before;
  const timeline = useMemo(
    () => (compare && timelineQuery.data ? buildTimelineSeries(compare, timelineQuery.data) : null),
    [compare, timelineQuery.data]
  );

  const openSurface = (target: "logs" | "traces", startMs: number, endMs: number) => {
    if (!seed?.serviceName) return;
    setCustomTimeRange(startMs, endMs, "Deployment comparison");
    navigate(dynamicNavigateOptions(
      target === "logs" ? ROUTES.logs : ROUTES.traces,
      target === "logs"
        ? buildServiceLogsSearch(location.search, seed.serviceName)
        : buildServiceTracesSearch(location.search, seed.serviceName),
    ));
  };

  const endpointColumns = useMemo<
    SimpleTableColumn<DeploymentCompareResponse["top_endpoints"][number]>[]
  >(
    () => [
      {
        title: "Endpoint",
        key: "endpoint",
        width: 320,
        render: (_value, row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-[var(--text-primary)]">
              {row.endpoint_name || row.operation_name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {row.http_method || "—"} • span {row.operation_name}
            </span>
          </div>
        ),
      },
      {
        title: "p95 Δ",
        key: "p95_delta_ms",
        align: "right",
        width: 120,
        render: (_value, row) => <DeltaPill delta={row.p95_delta_ms} formatter={formatDuration} />,
      },
      {
        title: "Err Δ",
        key: "error_rate_delta",
        align: "right",
        width: 120,
        render: (_value, row) => (
          <DeltaPill delta={row.error_rate_delta} formatter={(value) => formatPercentage(value)} />
        ),
      },
      {
        title: "Requests",
        key: "requests",
        align: "right",
        width: 110,
        render: (_value, row) => formatNumber(row.after_requests),
      },
      {
        title: "Score",
        key: "regression_score",
        align: "right",
        width: 110,
        render: (_value, row) => row.regression_score.toFixed(1),
      },
    ],
    []
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      direction="right"
    >
      <DrawerContent
        className="top-[var(--space-header-h,56px)] right-0 bottom-0 left-auto z-[1100] h-auto select-text overflow-y-auto border-[var(--border-color)] border-l"
        style={{ width: "min(1120px, calc(100vw - 20px))" }}
      >
        <DrawerHeader className="items-start border-[var(--border-color)] border-b bg-[linear-gradient(180deg,var(--color-primary-subtle-15),var(--color-primary-subtle-02))]">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                  <GitCompare size={18} className="shrink-0" />
                  <span className="truncate">
                    {title || seed?.serviceName || "Deployment compare"}
                  </span>
                </DrawerTitle>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                  Compare release impact across error hotspots, endpoint latency, and traffic shape.
                </p>
                <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  For CI or build logs, use the log explorer with attributes such as{" "}
                  <code className="rounded bg-[var(--bg-tertiary)] px-1">optik.ci.pipeline</code> or{" "}
                  <code className="rounded bg-[var(--bg-tertiary)] px-1">git.commit.sha</code> when
                  your pipeline emits them (see{" "}
                  <span className="text-[var(--text-secondary)]">docs/telemetry-contracts.md</span>
                  ). Quick links below open service-scoped logs/traces for the selected window.
                </p>
              </div>
              <DrawerClose
                aria-label="Close"
                className="shrink-0 rounded-[var(--card-radius)] border border-[var(--border-color)] px-3 py-1 text-[18px] text-[var(--text-secondary)] leading-none transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                &times;
              </DrawerClose>
            </div>

            {seed ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{seed.version}</Badge>
                <Badge variant="default">{seed.environment || "unknown env"}</Badge>
                <Badge variant={seed.isActive ? "success" : "warning"}>
                  {seed.isActive ? "Active release" : "Historical release"}
                </Badge>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  deployed {formatRelativeTime(seed.deployedAtMs)}
                </span>
                {seed.lastSeenAtMs ? (
                  <span className="text-[12px] text-[var(--text-muted)]">
                    last seen {formatRelativeTime(seed.lastSeenAtMs)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </DrawerHeader>

        {!seed ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            Deployment metadata is missing, so the compare view cannot be opened from this link.
          </div>
        ) : compareQuery.isLoading ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            Loading deployment comparison…
          </div>
        ) : compareQuery.isError ? (
          <div className="px-6 py-6 text-[13px] text-[var(--color-error)]">
            Deployment comparison is unavailable right now.
          </div>
        ) : !compare ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            No deployment comparison data was returned for this release.
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
              <SummaryCard
                label="Requests"
                beforeValue={summaryBefore?.request_count}
                afterValue={compare.summary.after.request_count}
                delta={compare.summary.after.request_count - (summaryBefore?.request_count ?? 0)}
                formatter={formatNumber}
              />
              <SummaryCard
                label="Errors"
                beforeValue={summaryBefore?.error_count}
                afterValue={compare.summary.after.error_count}
                delta={compare.summary.after.error_count - (summaryBefore?.error_count ?? 0)}
                formatter={formatNumber}
              />
              <SummaryCard
                label="Error Rate"
                beforeValue={summaryBefore?.error_rate}
                afterValue={compare.summary.after.error_rate}
                delta={compare.summary.after.error_rate - (summaryBefore?.error_rate ?? 0)}
                formatter={(value) => formatPercentage(value)}
                invertDelta
              />
              <SummaryCard
                label="P95"
                beforeValue={summaryBefore?.p95_ms}
                afterValue={compare.summary.after.p95_ms}
                delta={compare.summary.after.p95_ms - (summaryBefore?.p95_ms ?? 0)}
                formatter={formatDuration}
                invertDelta
              />
              <SummaryCard
                label="P99"
                beforeValue={summaryBefore?.p99_ms}
                afterValue={compare.summary.after.p99_ms}
                delta={compare.summary.after.p99_ms - (summaryBefore?.p99_ms ?? 0)}
                formatter={formatDuration}
                invertDelta
              />
            </div>

            <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radar size={16} className="text-[var(--color-primary)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Deployment window</h3>
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                    {compare.has_baseline && compare.before_window
                      ? `Before: ${formatWindowLabel(compare.before_window.start_ms, compare.before_window.end_ms)}`
                      : "No prior deployment baseline exists for this release."}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                    After:{" "}
                    {formatWindowLabel(compare.after_window.start_ms, compare.after_window.end_ms)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compare.before_window ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<GitBranch size={14} />}
                        onClick={() =>
                          openSurface(
                            "traces",
                            compare.before_window!.start_ms,
                            compare.before_window!.end_ms
                          )
                        }
                      >
                        Traces before
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ArrowUpRight size={14} />}
                        onClick={() =>
                          openSurface(
                            "logs",
                            compare.before_window!.start_ms,
                            compare.before_window!.end_ms
                          )
                        }
                      >
                        Logs before
                      </Button>
                    </>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<GitBranch size={14} />}
                    onClick={() =>
                      openSurface(
                        "traces",
                        compare.after_window.start_ms,
                        compare.after_window.end_ms
                      )
                    }
                  >
                    Traces after
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ArrowUpRight size={14} />}
                    onClick={() =>
                      openSurface(
                        "logs",
                        compare.after_window.start_ms,
                        compare.after_window.end_ms
                      )
                    }
                  >
                    Logs after
                  </Button>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Version traffic</h3>
                  <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                    Release-centered traffic view across the baseline and post-deploy windows.
                  </p>
                </div>
                <Badge variant="info">Release {compare.deployment.version}</Badge>
              </div>
              {timelineQuery.isLoading ? (
                <div className="text-[12px] text-[var(--text-muted)]">Loading version traffic…</div>
              ) : timeline ? (
                <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(15,18,25,0.35)] p-3">
                  <ObservabilityChart
                    timestamps={timeline.timestamps}
                    series={timeline.series.map((series) => ({
                      ...series,
                      width: series.label === compare.deployment.version ? 2.4 : 1.6,
                    }))}
                    height={250}
                    yFormatter={(value) => `${value.toFixed(value >= 10 ? 0 : 1)} rps`}
                    legend
                  />
                </div>
              ) : (
                <div className="text-[12px] text-[var(--text-muted)]">
                  No version traffic was found.
                </div>
              )}
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[var(--color-warning)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Top error regressions
                  </h3>
                </div>
                {compare.top_errors.length === 0 ? (
                  <div className="text-[12px] text-[var(--text-muted)]">
                    {compare.has_baseline
                      ? "No notable error regressions were found for this release."
                      : "A previous deployment baseline is required to rank error regressions."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compare.top_errors.map((errorRow) => (
                      <div
                        key={errorRow.group_id}
                        className="rounded-[var(--card-radius)] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              errorRow.severity === "critical"
                                ? "error"
                                : errorRow.severity === "warning"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {errorRow.http_status_code || "error"}
                          </Badge>
                          <DeltaPill delta={errorRow.delta_count} formatter={formatNumber} />
                        </div>
                        <div className="mt-2 font-medium text-[var(--text-primary)]">
                          {errorRow.status_message || errorRow.operation_name || "Unhandled error"}
                        </div>
                        <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
                          {errorRow.operation_name} • before {formatNumber(errorRow.before_count)} •
                          after {formatNumber(errorRow.after_count)}
                        </div>
                        {errorRow.sample_trace_id ? (
                          <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                            sample trace {errorRow.sample_trace_id.slice(0, 12)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
                <div className="mb-4 flex items-center gap-2">
                  <GitCompare size={16} className="text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Endpoint regressions</h3>
                </div>
                {compare.top_endpoints.length === 0 ? (
                  <div className="text-[12px] text-[var(--text-muted)]">
                    No endpoint regression candidates were found for this release.
                  </div>
                ) : (
                  <SimpleTable
                    columns={endpointColumns}
                    dataSource={compare.top_endpoints}
                    pagination={false}
                    size="middle"
                    rowKey={(row) =>
                      `${row.http_method}:${row.endpoint_name}:${row.operation_name}`
                    }
                  />
                )}
              </Card>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
