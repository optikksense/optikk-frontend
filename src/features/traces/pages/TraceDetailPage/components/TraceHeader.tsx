import {
  ArrowLeft,
  Bell,
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Share2,
  Zap,
} from "lucide-react";
import { memo, useCallback, useState } from "react";

import { useTimezone } from "@/app/store/appStore";

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

function httpBadgeClass(status: number | undefined): string {
  if (status == null) return "";
  if (status >= 500) return "tdp-badge-http-5xx";
  if (status >= 400) return "tdp-badge-http-4xx";
  return "tdp-badge-http-2xx";
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
    <header className="tdp-hdr">
      <div className="tdp-hdr-l">
        <div className="tdp-crumbs">
          <button
            type="button"
            className="tdp-iconbtn"
            onClick={onBack}
            title="Back to traces"
            aria-label="Back to traces"
          >
            <ArrowLeft size={13} />
          </button>
          <span className="tdp-crumb-mute">Traces</span>
          {rootService && (
            <>
              <span className="tdp-crumb-sep">/</span>
              <span className="tdp-crumb-mute">{rootService}</span>
            </>
          )}
          {rootOperation && (
            <>
              <span className="tdp-crumb-sep">/</span>
              <span className="tdp-crumb-mute" title={rootOperation}>
                {rootOperation}
              </span>
            </>
          )}
          <span className="tdp-crumb-sep">/</span>
          <span className="tdp-crumb">{traceId.slice(0, 12)}…</span>
        </div>

        <div className="tdp-title-row">
          <span
            className={`tdp-status-dot ${errored ? "tdp-status-error" : "tdp-status-ok"}`}
            title={errored ? "Errored trace" : "OK"}
          />
          <h1 className="tdp-title">{rootOperation || "Trace"}</h1>
          <div className="tdp-env-badges">
            {environment && (
              <span className={`tdp-badge ${environment === "prod" ? "tdp-badge-prod" : ""}`}>
                {environment}
              </span>
            )}
            {region && <span className="tdp-badge">{region}</span>}
            {httpMethod && <span className="tdp-badge tdp-badge-method">{httpMethod}</span>}
            {httpStatus != null && (
              <span className={`tdp-badge ${httpBadgeClass(httpStatus)}`}>{httpStatus}</span>
            )}
          </div>
        </div>

        <div className="tdp-tid-row">
          <span className="tdp-tid-label">trace_id</span>
          <code className="tdp-tid">{traceId}</code>
          <CopyTraceId traceId={traceId} />
          {startMs && startMs > 0 && (
            <>
              <span className="tdp-tid-sep">·</span>
              <span className="tdp-tid-label">started</span>
              <code className="tdp-tid-mute">{formatStartTime(startMs, tz)}</code>
            </>
          )}
        </div>
      </div>

      <div className="tdp-hdr-r">
        <button
          type="button"
          className="tdp-btn tdp-btn-ghost"
          onClick={onOpenInLogs}
          title="View correlated logs"
        >
          <ExternalLink size={13} /> Logs
        </button>
        <button
          type="button"
          className="tdp-btn tdp-btn-ghost"
          title="Create alert (coming soon)"
          disabled
        >
          <Bell size={13} /> Alert
        </button>
        <button
          type="button"
          className="tdp-btn tdp-btn-ghost"
          title="Copy share link"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
        >
          <Share2 size={13} /> Share
        </button>
        <button
          type="button"
          className="tdp-btn tdp-btn-primary"
          title="Investigate (coming soon)"
          disabled
        >
          <Zap size={13} /> Investigate
        </button>
        <button
          type="button"
          className="tdp-iconbtn"
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
      className="tdp-iconbtn"
      onClick={onCopy}
      title="Copy trace ID"
      aria-label="Copy trace ID"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export const TraceHeader = memo(TraceHeaderComponent);
