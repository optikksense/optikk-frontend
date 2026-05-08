import { PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import {
  getActiveRequests,
  getClientDuration,
  getDNSDuration,
  getRequestBodySize,
  getRequestDuration,
  getResponseBodySize,
  getTLSDuration,
  getTopExternalHosts,
  getTopRoutesByLatency,
  getTopRoutesByVolume,
  type HistogramSummary,
} from "../api/httpMetricsApi";

function fmtMs(v: number | undefined): string {
  if (v == null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function fmtBytes(v: number | undefined): string {
  if (v == null) return "—";
  if (v >= 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`;
  if (v >= 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${Math.round(v)} B`;
}

function HistogramTile({
  label,
  hist,
  format,
}: {
  label: string;
  hist: HistogramSummary | undefined;
  format: (v: number | undefined) => string;
}) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">p50</div>
          <div className="font-semibold text-[var(--text-primary)]">{format(hist?.p50)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">p95</div>
          <div className="font-semibold text-[var(--text-primary)]">{format(hist?.p95)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">p99</div>
          <div className="font-semibold text-[var(--text-primary)]">{format(hist?.p99)}</div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  readonly serviceName: string;
}

export function HttpDetailSection({ serviceName }: Props) {
  const params = { serviceName };
  const requestDur = useTimeRangeQuery("http-req-dur", (_t, s, e) =>
    getRequestDuration(Number(s), Number(e), params)
  );
  const clientDur = useTimeRangeQuery("http-client-dur", (_t, s, e) =>
    getClientDuration(Number(s), Number(e), params)
  );
  const reqBody = useTimeRangeQuery("http-req-body", (_t, s, e) =>
    getRequestBodySize(Number(s), Number(e), params)
  );
  const respBody = useTimeRangeQuery("http-resp-body", (_t, s, e) =>
    getResponseBodySize(Number(s), Number(e), params)
  );
  const dnsDur = useTimeRangeQuery("http-dns", (_t, s, e) =>
    getDNSDuration(Number(s), Number(e), params)
  );
  const tlsDur = useTimeRangeQuery("http-tls", (_t, s, e) =>
    getTLSDuration(Number(s), Number(e), params)
  );
  const active = useTimeRangeQuery("http-active", (_t, s, e) =>
    getActiveRequests(Number(s), Number(e), params)
  );
  const topVolume = useTimeRangeQuery("http-top-volume", (_t, s, e) =>
    getTopRoutesByVolume(Number(s), Number(e), { ...params, limit: 5 })
  );
  const topLatency = useTimeRangeQuery("http-top-latency", (_t, s, e) =>
    getTopRoutesByLatency(Number(s), Number(e), { ...params, limit: 5 })
  );
  const externals = useTimeRangeQuery("http-externals", (_t, s, e) =>
    getTopExternalHosts(Number(s), Number(e), { ...params, limit: 5 })
  );

  const activePoints = (active.data as Array<{ value?: number }> | undefined) ?? [];
  const lastActive = activePoints[activePoints.length - 1]?.value;

  return (
    <PageSurface padding="lg">
      <div className="mb-3 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
        HTTP detail
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HistogramTile label="Server duration" hist={requestDur.data} format={fmtMs} />
        <HistogramTile label="Client duration" hist={clientDur.data} format={fmtMs} />
        <HistogramTile label="DNS lookup" hist={dnsDur.data} format={fmtMs} />
        <HistogramTile label="TLS handshake" hist={tlsDur.data} format={fmtMs} />
        <HistogramTile label="Request body" hist={reqBody.data} format={fmtBytes} />
        <HistogramTile label="Response body" hist={respBody.data} format={fmtBytes} />
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            In-flight requests
          </div>
          <div className="mt-1 font-semibold text-[18px] tabular-nums text-[var(--text-primary)]">
            {lastActive != null ? formatNumber(lastActive) : "—"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <RouteListBlock title="Top routes by volume" rows={topVolume.data ?? []} />
        <RouteListBlock title="Top routes by latency" rows={topLatency.data ?? []} />
        <RouteListBlock title="Top external hosts" rows={externals.data ?? []} keyField="host" />
      </div>
    </PageSurface>
  );
}

function RouteListBlock({
  title,
  rows,
  keyField = "route",
}: {
  title: string;
  rows: ReadonlyArray<Record<string, unknown>>;
  keyField?: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="mt-2 text-[12px] text-[var(--text-muted)]">—</div>
      ) : (
        <ol className="mt-2 list-decimal pl-5 text-[12px] text-[var(--text-secondary)]">
          {rows.slice(0, 5).map((r) => (
            <li key={String(r[keyField] ?? Math.random())} className="font-mono">
              {String(r[keyField] ?? r.route ?? "—")}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
