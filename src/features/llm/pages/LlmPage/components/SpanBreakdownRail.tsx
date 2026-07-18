import { useMemo } from "react";

import { Surface } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import type { LlmApp } from "../../../api/llmApi";
import { OPERATION_META } from "../../../utils/llmFormat";
import { OperationChip } from "./LlmChips";

const KINDS = [
  { key: "chat", pick: (a: LlmApp) => a.llmSpans, billed: true },
  { key: "tool", pick: (a: LlmApp) => a.toolSpans, billed: false },
  { key: "retrieval", pick: (a: LlmApp) => a.retrievalSpans, billed: false },
  { key: "embedding", pick: (a: LlmApp) => a.embeddingSpans, billed: false },
  { key: "agent", pick: (a: LlmApp) => a.agentSpans, billed: false },
] as const;

// Right-rail bars: what the apps' requests actually do, summed client-side
// from the already-loaded apps list.
export default function SpanBreakdownRail({ apps }: { readonly apps: LlmApp[] }) {
  const rows = useMemo(() => {
    const sums = KINDS.map((k) => ({
      ...k,
      value: apps.reduce((acc, a) => acc + k.pick(a), 0),
    }));
    const max = Math.max(1, ...sums.map((s) => s.value));
    return sums.map((s) => ({ ...s, pct: (s.value / max) * 100 }));
  }, [apps]);

  return (
    <Surface elevation={1} padding="md">
      <div className="mb-3 flex items-center gap-2">
        <div>
          <div className="font-medium text-[13px] text-foreground">Span breakdown</div>
          <div className="text-foreground-muted text-xs">what each request actually does</div>
        </div>
        <div className="flex-1" />
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground-muted">
          billed: LLM only
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="mb-1 flex items-center gap-2">
              <OperationChip operation={r.key} />
              <span className="text-foreground-muted text-xs">{r.billed ? "billed" : "free"}</span>
              <span className="flex-1" />
              <span className="font-mono font-semibold text-foreground text-xs">
                {formatNumber(r.value)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded"
                style={{ width: `${r.pct}%`, backgroundColor: OPERATION_META[r.key].color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
