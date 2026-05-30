import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { TrendIndicatorProps } from "./types";

export default function TrendIndicator({
  value,
  inverted = false,
  showValue = true,
}: TrendIndicatorProps): JSX.Element {
  if (value == null || value === 0) {
    return (
      <span className="trend-indicator" style={{ color: "var(--text-muted)" }}>
        <Minus size={14} />
        {showValue && <span>0%</span>}
      </span>
    );
  }

  const isPositive = value > 0;
  const isGood = inverted ? !isPositive : isPositive;
  const color = isGood ? "var(--color-success)" : "var(--color-error)";
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginTop: 8,
        fontSize: 12,
        color,
      }}
    >
      <Icon size={14} />
      {showValue && <span>{Math.abs(value)}%</span>}
    </span>
  );
}
