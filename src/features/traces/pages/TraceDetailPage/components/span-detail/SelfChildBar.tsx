import { memo } from "react";

import { formatDuration } from "@shared/utils/formatters";

interface Props {
  /** Wall time spent in the span itself (excluding descendants), in ms. */
  readonly selfMs: number;
  /** Wall time covered by descendant spans, in ms. */
  readonly childMs: number;
}

/**
 * Small stacked bar splitting a span's duration into self-time vs child-time.
 * Self-time (where the span itself does work) is the actionable share; the
 * child portion is time waited on downstream spans.
 */
function SelfChildBarComponent({ selfMs, childMs }: Props) {
  const total = Math.max(0, selfMs) + Math.max(0, childMs);
  if (total <= 0) return null;
  const selfPct = (selfMs / total) * 100;
  const childPct = 100 - selfPct;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-2 w-full overflow-hidden rounded-[3px] bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${selfPct}%` }}
          title={`Self ${formatDuration(selfMs)}`}
        />
        <div
          className="h-full bg-accent"
          style={{ width: `${childPct}%` }}
          title={`Children ${formatDuration(childMs)}`}
        />
      </div>
      <div className="flex justify-between font-mono text-[10.5px] text-foreground-caption">
        <span>
          <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-[1px]" />
          self {selfPct.toFixed(0)}%
        </span>
        <span>
          <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent align-[1px]" />
          children {childPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export const SelfChildBar = memo(SelfChildBarComponent);
