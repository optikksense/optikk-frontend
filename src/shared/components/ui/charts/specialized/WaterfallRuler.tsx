import { memo } from "react";

import { formatDuration } from "@shared/utils/formatters";

/** Time-axis ruler with N ticks spanning the bar area, matching Datadog waterfall. */
function WaterfallRulerComponent({ traceDuration }: { traceDuration: number }) {
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return (
    <div className="relative h-5 border-b border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)]">
      <div className="absolute inset-x-0 flex h-full" style={{ paddingLeft: 360 }}>
        {ticks.map((i) => (
          <div
            key={i}
            className="relative flex-1 text-[10px] text-[var(--text-muted)]"
          >
            <span
              className="absolute left-0 top-0 -translate-x-1/2 whitespace-nowrap"
              style={{ display: i === 0 ? "none" : undefined }}
            >
              {formatDuration((traceDuration * i) / 10)}
            </span>
            <span className="absolute bottom-0 left-0 h-1 w-px bg-[var(--glass-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const WaterfallRuler = memo(WaterfallRulerComponent);
