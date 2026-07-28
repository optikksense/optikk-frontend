import type { LlmTraceScore } from "../api/llmApi";

export function ScorePill({ score }: { readonly score: LlmTraceScore }) {
  if (score.dataType === "boolean") {
    const pass = score.value >= 0.5;
    const color = pass ? "var(--ok)" : "var(--err)";
    return (
      <span
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-[10px]"
        style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
        title={score.name}
      >
        {score.name}: {pass ? "pass" : "fail"}
      </span>
    );
  }
  if (score.dataType === "categorical") {
    return (
      <span
        className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground-secondary"
        title={score.name}
      >
        {score.name}: {score.stringValue || "—"}
      </span>
    );
  }
  const pct = Math.max(0, Math.min(1, score.value)) * 100;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] text-foreground-secondary"
      title={score.name}
    >
      <span className="text-foreground-muted">{score.name}</span>
      <span
        className="relative h-1.5 w-10 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--border)" }}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: "var(--chart-3)" }}
        />
      </span>
      <span className="font-mono">{score.value.toFixed(2)}</span>
    </span>
  );
}
