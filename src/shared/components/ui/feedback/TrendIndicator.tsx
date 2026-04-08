import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { APP_COLORS } from "@config/colorLiterals";

import type { TrendIndicatorProps } from "./types";

export default function TrendIndicator({
  value,
  inverted = false,
  showValue = true,
}: TrendIndicatorProps): JSX.Element {
  if (value == null || value === 0) {
    return (
      <span className="trend-indicator" style={{ color: APP_COLORS.hex_98a2b3 }}>
        <Minus size={14} />
        {showValue && <span>0%</span>}
      </span>
    );
  }

  const isPositive = value > 0;
  const isGood = inverted ? !isPositive : isPositive;
  const color = isGood ? APP_COLORS.hex_73c991 : APP_COLORS.hex_f04438;
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
