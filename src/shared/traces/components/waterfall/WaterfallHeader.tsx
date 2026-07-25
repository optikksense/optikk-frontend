import { cn } from "@shared/lib/utils";
import { formatDuration } from "@shared/utils/formatters";
import { memo } from "react";
import { lblBase, wfGrid } from "./WaterfallTraceRow";

interface Props {
  readonly ticks: readonly { t: number; pct: number }[];
}

function WaterfallHeaderComponent({ ticks }: Props) {
  return (
    <div className={cn(wfGrid, "sticky top-0 z-[5] border-border border-b bg-background")}>
      <div
        className={cn(
          lblBase,
          "!text-[10.5px] h-[34px] text-foreground-caption uppercase tracking-[0.06em]"
        )}
      >
        Service · Operation
      </div>
      <div className="relative h-[34px]">
        <div className="relative h-full">
          {ticks.map(({ t, pct }) => (
            <div key={t} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
              <div className="absolute top-2 bottom-2 w-px bg-border" />
              <div
                className={cn(
                  "-translate-x-1/2 absolute bottom-[5px] whitespace-nowrap bg-background px-[3px] font-mono text-[10px] text-foreground-caption [font-variant-numeric:tabular-nums]",
                  pct < 4 && "!left-0 !translate-x-0",
                  pct > 96 && "!-translate-x-full"
                )}
              >
                {formatDuration(t)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const WaterfallHeader = memo(WaterfallHeaderComponent);
