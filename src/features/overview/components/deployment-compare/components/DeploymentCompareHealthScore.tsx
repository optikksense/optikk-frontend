import { memo } from "react";

import type { DeploymentCompareResponse } from "@shared/api/deployments/deploymentsApi";
import { Badge, Card } from "@shared/components/primitives/ui";

interface Props {
  compare: DeploymentCompareResponse;
}

interface Verdict {
  readonly score: number;
  readonly label: "stable" | "watch" | "critical";
  readonly tone: "success" | "warning" | "error";
}

function pctDelta(before: number | undefined, after: number): number {
  if (!before || before <= 0) return 0;
  return ((after - before) / before) * 100;
}

function scoreFromDeltas(deltas: { errorRate: number; p95: number; p99: number }): number {
  const errorPenalty = Math.min(40, Math.max(0, deltas.errorRate * 10));
  const p95Penalty = Math.min(25, Math.max(0, deltas.p95 * 0.5));
  const p99Penalty = Math.min(20, Math.max(0, deltas.p99 * 0.5));
  return Math.round(Math.max(0, 100 - errorPenalty - p95Penalty - p99Penalty));
}

function computeVerdict(compare: DeploymentCompareResponse): Verdict {
  const before = compare.summary.before;
  const after = compare.summary.after;
  const deltas = {
    errorRate: pctDelta(before?.error_rate, after.error_rate),
    p95: pctDelta(before?.p95_ms, after.p95_ms),
    p99: pctDelta(before?.p99_ms, after.p99_ms),
  };
  const score = scoreFromDeltas(deltas);
  if (score >= 85) return { score, label: "stable", tone: "success" };
  if (score >= 65) return { score, label: "watch", tone: "warning" };
  return { score, label: "critical", tone: "error" };
}

function DeploymentCompareHealthScoreComponent({ compare }: Props) {
  const verdict = computeVerdict(compare);
  if (!compare.has_baseline) return null;

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Release health score
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-semibold text-[32px] text-[var(--text-primary)] leading-none">
              {verdict.score}
            </span>
            <Badge variant={verdict.tone}>{verdict.label}</Badge>
          </div>
        </div>
        <p className="max-w-md text-[12px] text-[var(--text-secondary)]">
          Derived client-side from error-rate, p95, and p99 deltas against the prior baseline.
        </p>
      </div>
    </Card>
  );
}

export const DeploymentCompareHealthScore = memo(DeploymentCompareHealthScoreComponent);
