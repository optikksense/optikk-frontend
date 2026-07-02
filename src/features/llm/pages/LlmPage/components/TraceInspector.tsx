import { Skeleton, Surface } from "@/components/ui";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { LlmTraceDetail } from "../../../api/llmApi";
import { OPERATION_META, formatCost } from "../../../utils/llmFormat";
import { OperationChip, StatusBadge } from "./LlmChips";

export default function TraceInspector({
  detail,
  loading,
  onClose,
}: {
  readonly detail: LlmTraceDetail | undefined;
  readonly loading: boolean;
  readonly onClose: () => void;
}) {
  return (
    <Surface elevation={1} padding="md">
      {loading || !detail ? (
        <Skeleton count={4} />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div>
              <div className="font-medium font-mono text-[13px] text-foreground">
                trace · {detail.traceId}
              </div>
              <div className="text-foreground-muted text-xs">
                {detail.service} · {detail.spans.length} spans · {formatDuration(detail.durationMs)}{" "}
                · {formatNumber(detail.inputTokens)} in / {formatNumber(detail.outputTokens)} out ·{" "}
                {formatCost(detail.cost)}
              </div>
            </div>
            <div className="flex-1" />
            <StatusBadge hasError={detail.hasError} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2 py-1 text-foreground-secondary text-xs hover:text-foreground"
            >
              Close
            </button>
          </div>

          {detail.prompt || detail.output ? (
            <div className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-3">
                <div className="mb-1 font-medium text-[11px] text-foreground-muted uppercase tracking-wide">
                  User prompt
                </div>
                <div className="text-foreground-secondary text-sm leading-relaxed">
                  {detail.prompt || "—"}
                </div>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <div className="mb-1 font-medium text-[11px] text-foreground-muted uppercase tracking-wide">
                  Model output
                </div>
                <div className="text-foreground-secondary text-sm leading-relaxed">
                  {detail.output || "—"}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col">
            {detail.spans.map((span) => {
              const meta = OPERATION_META[span.operation] ?? OPERATION_META.other;
              const offsetPct =
                detail.durationMs > 0
                  ? ((span.startMs - detail.startMs) / detail.durationMs) * 100
                  : 0;
              const widthPct =
                detail.durationMs > 0
                  ? Math.max((span.durationMs / detail.durationMs) * 100, 1)
                  : 100;
              return (
                <div
                  key={span.spanId}
                  className="grid grid-cols-[90px_minmax(180px,1.2fr)_70px_1fr] items-center gap-3 border-border border-b py-1.5 last:border-b-0"
                >
                  <OperationChip operation={span.operation} />
                  <div className="min-w-0">
                    <span className="font-mono text-foreground text-xs">{span.name}</span>
                    <span className="ml-2 font-mono text-[11px] text-foreground-muted">
                      {span.model ? `${span.model} · ` : ""}
                      {span.inputTokens || span.outputTokens
                        ? `${formatNumber(span.inputTokens)} in / ${formatNumber(span.outputTokens)} out`
                        : span.service}
                    </span>
                  </div>
                  <span className="text-right font-mono text-foreground-secondary text-xs">
                    {formatDuration(span.durationMs)}
                  </span>
                  <div className="relative h-2 rounded bg-muted">
                    <div
                      className="absolute top-0 h-full rounded"
                      style={{
                        left: `${Math.min(Math.max(offsetPct, 0), 99)}%`,
                        width: `${Math.min(widthPct, 100 - Math.min(Math.max(offsetPct, 0), 99))}%`,
                        backgroundColor: meta.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Surface>
  );
}
