import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { TimingFacts } from "@shared/traces/utils/timing";
import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";

interface Props {
  readonly timing: TimingFacts;
}

function SelfChildBar({ durMs, selfMs }: { readonly durMs: number; readonly selfMs: number }) {
  const childMs = Math.max(0, durMs - selfMs);
  const selfPct = durMs > 0 ? (selfMs / durMs) * 100 : 100;
  const childPct = durMs > 0 ? (childMs / durMs) * 100 : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${selfPct}%` }}
          title={`Self time: ${formatDuration(selfMs)} (${selfPct.toFixed(1)}%)`}
        />
        <div
          className="h-full bg-secondary-hover"
          style={{ width: `${childPct}%` }}
          title={`Child time: ${formatDuration(childMs)} (${childPct.toFixed(1)}%)`}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-foreground-caption">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> Self: {formatDuration(selfMs)} (
          {selfPct.toFixed(0)}%)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-secondary-hover" /> Children:{" "}
          {formatDuration(childMs)} ({childPct.toFixed(0)}%)
        </span>
      </div>
    </div>
  );
}

function SpanTimingSectionComponent({ timing }: Props) {
  return (
    <DrawerSection title="Span Timing & Wall Time">
      <div className="flex flex-col gap-3 rounded-md border border-border bg-secondary p-3.5">
        <div className="grid grid-cols-3 gap-2 text-[12px]">
          <div>
            <div className="text-[11px] text-foreground-caption uppercase">Duration</div>
            <div className="font-medium font-mono text-foreground">
              {formatDuration(timing.durMs)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-foreground-caption uppercase">Self Time</div>
            <div className="font-medium font-mono text-foreground">
              {formatDuration(timing.selfMs)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-foreground-caption uppercase">% of Trace</div>
            <div className="font-medium font-mono text-foreground">
              {timing.pctOfTrace.toFixed(1)}%
            </div>
          </div>
        </div>

        <SelfChildBar durMs={timing.durMs} selfMs={timing.selfMs} />
      </div>
    </DrawerSection>
  );
}

export const SpanTimingSection = memo(SpanTimingSectionComponent);
