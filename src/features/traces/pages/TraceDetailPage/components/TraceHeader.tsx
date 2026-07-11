import { ArrowLeft, Check, Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { useTimezone } from "@/app/store/appStore";
import { cn } from "@shared/lib/utils";
import { formatTimestamp } from "@shared/utils/formatters";

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
  "inline-grid place-items-center w-6 h-6 rounded-md text-foreground-muted bg-transparent border-0 cursor-pointer hover:bg-muted hover:text-foreground disabled:opacity-50";

const crumbMute = "text-foreground-caption";
const crumbSep = "text-foreground-caption opacity-50";

const badge =
  "inline-flex items-center px-2 py-[2px] text-[11px] font-medium tracking-[0.02em] bg-muted text-foreground-muted border border-border rounded-full whitespace-nowrap";

const tidMonoSmall = "text-foreground-secondary font-mono text-[11.5px] break-all";
const tidLabel = "text-foreground-caption";
const tidMute = "text-foreground-muted font-mono text-[11.5px]";

function httpBadgeColor(status: number | undefined): string {
  if (status == null) return "";
  if (status >= 500) return "!text-error";
  if (status >= 400) return "!text-warning";
  return "!text-success";
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
    <header className="flex justify-between gap-6 border-border border-b bg-background px-5 pt-[14px] pb-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-foreground-caption">
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
          <span className="font-mono text-foreground-secondary">{traceId.slice(0, 12)}…</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "h-2 w-2 flex-shrink-0 rounded-full",
              errored
                ? "bg-error shadow-[0_0_0_4px_var(--color-error-subtle)]"
                : "bg-success shadow-[0_0_0_4px_var(--color-success-subtle)]"
            )}
            title={errored ? "Errored trace" : "OK"}
          />
          <h1 className="m-0 min-w-0 break-words font-mono font-semibold text-[20px] text-foreground tracking-[-0.015em]">
            {httpMethod ? `${httpMethod} ${rootOperation ?? ""}`.trim() : rootOperation || "Trace"}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {environment && (
              <span
                className={cn(
                  badge,
                  environment === "prod" && "border-success-subtle bg-success-subtle text-success"
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

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11.5px] text-foreground-caption">
          <span className={tidLabel}>trace_id</span>
          <code className={tidMonoSmall}>{traceId}</code>
          <CopyTraceId traceId={traceId} />
          {startMs && startMs > 0 && (
            <>
              <span className="text-foreground-caption opacity-40">·</span>
              <span className={tidLabel}>started</span>
              <code className={tidMute}>{formatTimestamp(startMs, tz)}</code>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-start gap-1.5">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-transparent px-[11px] py-1.5 font-medium text-[12.5px] text-foreground-secondary hover:border-border hover:bg-muted hover:text-foreground"
          onClick={onOpenInLogs}
          title="View correlated logs"
        >
          <ExternalLink size={13} /> Logs
        </button>
        <button type="button" className={iconBtn} title="More" aria-label="More options" disabled>
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
