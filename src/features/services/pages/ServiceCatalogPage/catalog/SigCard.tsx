import { useState } from "react";

const W = 220;
const H = 40;
const PAD = 2;

interface SigCardProps {
  readonly label: string;
  readonly displayValue: string;
  readonly secondary?: string;
  readonly values: number[];
  readonly format: (value: number) => string;
}

function buildPath(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(0.0001, max - min);
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 2 * PAD) - PAD;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function emptyChart() {
  return <div className="h-[40px] w-full rounded bg-[var(--bg-elevated,rgba(255,255,255,0.03))]" />;
}

export function SigCard({ label, displayValue, secondary, values, format }: SigCardProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hasData = values.length >= 2;
  const path = hasData ? buildPath(values) : "";
  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hasData) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setHoverIdx(Math.round(ratio * (values.length - 1)));
  };
  const headline = hoverIdx != null ? format(values[hoverIdx]) : displayValue;
  return (
    <div className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
      <div className="flex items-baseline justify-between text-[11px] text-[var(--text-muted)]">
        <span>{label}</span>
        <span>{hoverIdx != null ? `${values.length - 1 - hoverIdx}m ago` : secondary || ""}</span>
      </div>
      <div className="mt-1 font-semibold text-[16px] text-[var(--text-primary)]">{headline}</div>
      <div
        className="mt-1 cursor-crosshair"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {hasData ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-[40px] w-full"
            role="img"
            aria-label={`${label} sparkline`}
          >
            <path d={path} fill="none" stroke="var(--color-info,#3b82f6)" strokeWidth={1.25} />
          </svg>
        ) : (
          emptyChart()
        )}
      </div>
    </div>
  );
}
