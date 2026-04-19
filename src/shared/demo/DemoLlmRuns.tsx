import { DEMO_LLM_RUNS } from "./fixtures";

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatCost(cents: number): string {
  return `$${(cents / 100).toFixed(3)}`;
}

function scoreTone(score: number): string {
  if (score >= 0.9) return "#66C2A5";
  if (score >= 0.75) return "#F2C14E";
  return "#F04438";
}

export default function DemoLlmRuns() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
      <div
        className="grid gap-3 border-[var(--border-color)] border-b px-3 py-2 text-[11px] text-[var(--text-muted)] uppercase tracking-wider"
        style={{ gridTemplateColumns: "180px 1fr 80px 80px 80px 70px" }}
      >
        <span>Model</span>
        <span>Prompt</span>
        <span className="text-right">Tokens</span>
        <span className="text-right">Latency</span>
        <span className="text-right">Cost</span>
        <span className="text-right">Eval</span>
      </div>
      {DEMO_LLM_RUNS.map((run, i) => (
        <div
          key={i}
          className="grid items-center gap-3 border-[var(--border-color)] border-b px-3 py-2 text-[12px] last:border-b-0"
          style={{ gridTemplateColumns: "180px 1fr 80px 80px 80px 70px" }}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[var(--text-primary)]">
            {run.model}
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-secondary)]">
            {run.prompt}
          </span>
          <span className="text-right font-mono text-[var(--text-primary)] tabular-nums">
            {formatTokens(run.tokens)}
          </span>
          <span className="text-right font-mono text-[var(--text-primary)] tabular-nums">
            {run.latencyMs}ms
          </span>
          <span className="text-right font-mono text-[var(--text-primary)] tabular-nums">
            {formatCost(run.costCents)}
          </span>
          <span
            className="text-right font-mono font-semibold tabular-nums"
            style={{ color: scoreTone(run.evalScore) }}
          >
            {run.evalScore.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
