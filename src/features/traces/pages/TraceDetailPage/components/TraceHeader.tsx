import { ArrowLeft, Check, Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { useTimezone } from "@/app/store/appStore";
import { cn } from "@/lib/utils";

interface Stats {
  readonly totalSpans: number;
  readonly duration: number;
  readonly services: Set<string>;
  readonly errors: number;
}

interface Props {
  readonly traceId: string;
  readonly stats: Stats;
  readonly startMs?: number;
  readonly rootService?: string;
  readonly rootOperation?: string;
  readonly httpMethod?: string;
  readonly httpStatus?: number;
  readonly environment?: string;
  readonly region?: string;
  readonly onOpenInLogs: () => void;
  readonly onBack: () => void;
}

const iconBtn =
  "inline-grid place-items-center w-6 h-6 rounded-md text-[var(--text-muted)] bg-transparent border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-50";

const crumbMute = "text-[var(--text-caption)]";
const crumbSep = "text-[var(--text-caption)] opacity-50";

const badge =
  "inline-flex items-center px-2 py-[2px] text-[11px] font-medium tracking-[0.02em] bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-full whitespace-nowrap";

const tidMonoSmall =
  "text-[var(--text-secondary)] font-mono text-[11.5px] break-all";
const tidLabel = "text-[var(--text-caption)]";
const tidMute = "text-[var(--text-muted)] font-mono text-[11.5px]";

function formatStartTime(ms: number, tz: string): string {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    if (tz !== "local") opts.timeZone = tz;
    return new Intl.DateTimeFormat("sv-SE", opts).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().replace("T", " ").slice(0, 19);
  }
}

function httpBadgeColor(status: number | undefined): string {
  if (status == null) return "";
  if (status >= 500) return "!text-[var(--color-error)]";
  if (status >= 400) return "!text-[var(--color-warning)]";
  return "!text-[var(--color-success)]";
}

function TraceHeaderComponent({
  traceId,
  stats,
  startMs,
  rootService,
  rootOperation,
  httpMethod,
  httpStatus,
  environment,
  region,
  onOpenInLogs,
  onBack,
}: Props) {
  const tz = useTimezone();
  const errored = stats.errors > 0;

  return (
    <header className="flex justify-between gap-6 px-5 pt-[14px] pb-3 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5 items-center text-[12px] text-[var(--text-caption)]">
          <button
            type="button"
            className={iconBtn}
            onClick={onBack}
            title="Back to traces"
            aria-label="Back to traces"
          >
            <ArrowLeft size={13} />
          </button>
          <span className={crumbMute}>Traces</span>
          {rootService && (
            <>
              <span className={crumbSep}>/</span>
              <span className={crumbMute}>{rootService}</span>
            </>
          )}
          {rootOperation && (
            <>
              <span className={crumbSep}>/</span>
              <span className={crumbMute} title={rootOperation}>
                {rootOperation}
              </span>
            </>
          )}
          <span className={crumbSep}>/</span>
          <span className="text-[var(--text-secondary)] font-mono">{traceId.slice(0, 12)}…</span>
        </div>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              errored
                ? "bg-[var(--color-error)] shadow-[0_0_0_4px_var(--color-error-subtle)]"
                : "bg-[var(--color-success)] shadow-[0_0_0_4px_var(--color-success-subtle)]"
            )}
            title={errored ? "Errored trace" : "OK"}
          />
          <h1 className="m-0 text-[20px] font-semibold tracking-[-0.015em] text-[var(--text-primary)] min-w-0 break-words font-mono">
            {httpMethod ? `${httpMethod} ${rootOperation ?? ""}`.trim() : rootOperation || "Trace"}
          </h1>
          <div className="flex gap-1.5 flex-wrap">
            {environment && (
              <span
                className={cn(
                  badge,
                  environment === "prod" &&
                    "text-[var(--color-success)] border-[var(--color-success-subtle)] bg-[var(--color-success-subtle)]"
                )}
              >
                {environment}
              </span>
            )}
            {region && <span className={badge}>{region}</span>}
            {httpStatus != null && (
              <span className={cn(badge, httpBadgeColor(httpStatus))}>{httpStatus}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-2.5 text-[11.5px] text-[var(--text-caption)]">
          <span className={tidLabel}>trace_id</span>
          <code className={tidMonoSmall}>{traceId}</code>
          <CopyTraceId traceId={traceId} />
          {startMs && startMs > 0 && (
            <>
              <span className="text-[var(--text-caption)] opacity-40">·</span>
              <span className={tidLabel}>started</span>
              <code className={tidMute}>{formatStartTime(startMs, tz)}</code>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 items-start flex-shrink-0">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-md text-[12.5px] font-medium border border-transparent bg-transparent text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
          onClick={onOpenInLogs}
          title="View correlated logs"
        >
          <ExternalLink size={13} /> Logs
        </button>
        <button
          type="button"
          className={iconBtn}
          title="More"
          aria-label="More options"
          disabled
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </header>
  );
}

function CopyTraceId({ traceId }: { traceId: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(traceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  }, [traceId]);
  return (
    <button
      type="button"
      className={iconBtn}
      onClick={onCopy}
      title="Copy trace ID"
      aria-label="Copy trace ID"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export const TraceHeader = memo(TraceHeaderComponent);
