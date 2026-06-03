import { cn } from "@/lib/utils";

import type { Host, HostStatus } from "@/features/infrastructure/api/hostsApi";

import { fmtMs, fmtNum, fmtPct, relativeTimeFromIso } from "../formatters";

const STATUS_BORDER: Record<HostStatus, string> = {
  healthy: "border-border",
  warn: "border-[var(--color-warning,#f59e0b)]/40",
  error: "border-[var(--color-error,#ef4444)]/40",
};

function HostStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
      <span className="text-foreground-muted">{label}</span>
      <span className={tone ?? "text-foreground"}>{value}</span>
    </div>
  );
}

function errorTone(rate: number): string {
  if (rate >= 0.05) return "text-[var(--color-error,#ef4444)]";
  if (rate >= 0.02) return "text-[var(--color-warning,#f59e0b)]";
  return "text-foreground";
}

function p99Tone(p99: number): string {
  if (p99 >= 2000) return "text-[var(--color-error,#ef4444)]";
  if (p99 >= 1000) return "text-[var(--color-warning,#f59e0b)]";
  return "text-foreground";
}

function formatPct(value: number | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(0)}%`;
}

export function HostCard({ host, isOutlier }: { host: Host; isOutlier?: boolean }) {
  const errorRate = host.error_rate ?? 0;
  const p99Ms = host.p99_ms ?? 0;
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-md border bg-card px-3 py-2.5",
        STATUS_BORDER[host.status ?? "healthy"]
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-[12px] text-foreground">{host.host}</span>
        <div className="flex shrink-0 items-center gap-1">
          {isOutlier && (
            <span
              title="Error rate or p99 latency is a clear outlier vs the rest of this service's fleet"
              className="rounded bg-[var(--color-warning,#f59e0b)]/15 px-1.5 py-0.5 text-[10px] text-[var(--color-warning,#f59e0b)] uppercase"
            >
              outlier
            </span>
          )}
          {host.zone && (
            <span className="rounded bg-[var(--bg-elevated,rgba(255,255,255,0.06))] px-1.5 py-0.5 text-[10px] text-foreground-muted uppercase">
              {host.zone}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-y-1">
        <HostStat label="CPU" value={formatPct(host.cpu)} />
        <HostStat label="Mem" value={formatPct(host.mem)} />
        <HostStat label="Rate" value={`${fmtNum(host.rps ?? 0)}/s`} />
        <HostStat label="Errors" value={fmtPct(errorRate, 2)} tone={errorTone(errorRate)} />
        <HostStat label="p99" value={fmtMs(p99Ms)} tone={p99Tone(p99Ms)} />
      </div>
      <div className="text-right text-[10px] text-foreground-muted">
        seen {relativeTimeFromIso(host.last_seen ?? "")}
      </div>
    </article>
  );
}
