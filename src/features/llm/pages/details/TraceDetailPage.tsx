import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "@shared/components/primitives/ui";
import { PageShell } from "@shared/components/ui";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import Loading from "@shared/components/ui/feedback/Loading";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { LlmSpan } from "../../api/llmApi";
import { ObsChip, ScorePill } from "../../components/chips";
import { useLlmTraceDetail } from "../../hooks/useLlmQueries";
import { formatCost } from "../../utils/llmFormat";
import { StatusBadge, VendorChip } from "../LlmPage/components/LlmChips";

// Depth of each span from the root via parent chain, for tree indentation.
function computeDepths(spans: LlmSpan[]): Map<string, number> {
  const byId = new Map(spans.map((s) => [s.spanId, s]));
  const depth = new Map<string, number>();
  const resolve = (s: LlmSpan): number => {
    if (depth.has(s.spanId)) return depth.get(s.spanId) as number;
    const parent = s.parentSpanId ? byId.get(s.parentSpanId) : undefined;
    const d = parent ? resolve(parent) + 1 : 0;
    depth.set(s.spanId, d);
    return d;
  };
  for (const s of spans) resolve(s);
  return depth;
}

export default function TraceDetailPage() {
  const navigate = useNavigate();
  const { traceId } = useParams({ strict: false });
  const detailQ = useLlmTraceDetail(traceId ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const spans = detailQ.data?.spans ?? [];
  const depths = useMemo(() => computeDepths(spans), [spans]);
  const selected = spans.find((s) => s.spanId === selectedId) ?? spans[0];
  const d = detailQ.data;

  return (
    <PageShell>
      <button
        type="button"
        onClick={() => navigate({ to: "/llm" as string & {} })}
        className="mb-3 inline-flex items-center gap-1 text-[12px] text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to LLM
      </button>

      {detailQ.isPending ? (
        <Loading />
      ) : !d ? (
        <EmptyState title="Trace not found" />
      ) : (
        <div className="flex flex-col gap-3">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-foreground">{d.name || d.service}</span>
              <StatusBadge hasError={d.hasError} />
              <span className="font-mono text-[11px] text-foreground-muted">{d.traceId}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] text-foreground-secondary">
              {d.userId && <span>user: {d.userId}</span>}
              {d.sessionId && <span>session: {d.sessionId}</span>}
              {d.environment && <span>env: {d.environment}</span>}
              {d.release && <span>release: {d.release}</span>}
              <span>{formatDuration(d.durationMs)}</span>
              <span>
                {formatNumber(d.inputTokens)} in / {formatNumber(d.outputTokens)} out
              </span>
              <span>{formatCost(d.cost)}</span>
            </div>
            {(d.scores ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.scores?.map((s) => (
                  <ScorePill key={`${s.name}-${s.source}`} score={s} />
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
            <Card className="p-2">
              <div className="flex flex-col">
                {spans.map((s) => (
                  <button
                    type="button"
                    key={s.spanId}
                    onClick={() => setSelectedId(s.spanId)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] hover:bg-surface ${
                      selected?.spanId === s.spanId ? "bg-surface" : ""
                    }`}
                    style={{ paddingLeft: `${8 + (depths.get(s.spanId) ?? 0) * 16}px` }}
                  >
                    <ObsChip kind={s.kind || "span"} />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {s.name || s.operation}
                    </span>
                    <span className="font-mono text-[10px] text-foreground-muted">
                      {formatDuration(s.durationMs)}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-4">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <ObsChip kind={selected.kind || "span"} />
                    <span className="font-medium text-foreground text-sm">{selected.name}</span>
                    <VendorChip vendor={selected.vendor} />
                    <span className="font-mono text-[11px] text-foreground-muted">
                      {selected.responseModel || selected.model}
                    </span>
                  </div>
                  <InspectorBlock label="Input" text={selected.prompt} />
                  <InspectorBlock label="Output" text={selected.completion} />
                </>
              ) : (
                <p className="text-[12px] text-foreground-muted">Select an observation.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function InspectorBlock({
  label,
  text,
}: { readonly label: string; readonly text?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-[11px] text-foreground-muted uppercase tracking-wide">
        {label}
      </span>
      <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded border border-border bg-surface p-2 font-mono text-[11px] text-foreground-secondary">
        {text || "—"}
      </pre>
    </div>
  );
}
