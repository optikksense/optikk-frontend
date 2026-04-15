import { Play } from "lucide-react";
import { useState } from "react";

import { Button, Input } from "@/components/ui";

import { useBacktestRule } from "../hooks/useAlerts";
import type { AlertBacktestResult } from "../types";
import { RuleStateChip } from "./RuleStateChip";

interface BacktestPanelProps {
  readonly ruleId: string;
}

export function BacktestPanel({ ruleId }: BacktestPanelProps) {
  const [from, setFrom] = useState(() => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  const [to, setTo] = useState(() => new Date().toISOString());
  const backtest = useBacktestRule(ruleId);
  const result: AlertBacktestResult | undefined = backtest.data;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
            From
          </span>
          <Input value={from} onChange={(e) => setFrom(e.target.value)} className="w-56" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
            To
          </span>
          <Input value={to} onChange={(e) => setTo(e.target.value)} className="w-56" />
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={backtest.isPending}
          onClick={() => backtest.mutate({ from, to })}
        >
          <Play size={12} /> Run backtest
        </Button>
      </div>
      {backtest.isError && (
        <div className="text-[12px] text-[var(--color-danger)]">Failed to run backtest.</div>
      )}
      {result && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
            Transitions ({result.transitions.length})
          </div>
          <div className="flex flex-col gap-1">
            {result.transitions.map((evt, idx) => (
              <div
                key={`${evt.ts}-${idx}`}
                className="flex items-center gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1 text-[12px]"
              >
                <span className="text-[var(--text-muted)]">{evt.ts}</span>
                {evt.from_state && <RuleStateChip state={evt.from_state} />}
                <span className="text-[var(--text-muted)]">→</span>
                {evt.to_state && <RuleStateChip state={evt.to_state} />}
                <span className="text-[var(--text-secondary)]">{evt.message}</span>
              </div>
            ))}
            {result.transitions.length === 0 && (
              <div className="text-[12px] text-[var(--text-muted)]">
                No transitions would have fired in this window.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
