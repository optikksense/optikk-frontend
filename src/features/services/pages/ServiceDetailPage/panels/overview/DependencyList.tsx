import { CHART_THEME_DEFAULTS } from "@shared/utils/chartTheme";
import { fmtNum } from "@shared/utils/metricFormatters";
import type { ServiceMapListItem } from "./useTopologyData";

interface Props {
  upstreamList: ServiceMapListItem[];
  downstreamList: ServiceMapListItem[];
  onSelectFocus: (name: string) => void;
}

export function DependencyList({ upstreamList, downstreamList, onSelectFocus }: Props) {
  return (
    <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-0.5">
      {upstreamList.length === 0 && downstreamList.length === 0 && (
        <span className="text-[12.5px] text-foreground-muted">
          No dependencies captured for this service.
        </span>
      )}

      {upstreamList.map((d) => (
        <DependencyItem key={d.name} item={d} type="upstream" onSelect={onSelectFocus} />
      ))}

      {downstreamList.map((d) => (
        <DependencyItem key={d.name} item={d} type="downstream" onSelect={onSelectFocus} />
      ))}
    </div>
  );
}

function DependencyItem({
  item,
  type,
  onSelect,
}: {
  item: ServiceMapListItem;
  type: "upstream" | "downstream";
  onSelect: (name: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.name)}
      className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/40 bg-muted/15 p-2.5 text-left transition-colors hover:bg-muted/30"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor:
                item.status === "err"
                  ? CHART_THEME_DEFAULTS.err()
                  : item.status === "warn"
                    ? CHART_THEME_DEFAULTS.warn()
                    : CHART_THEME_DEFAULTS.ok(),
            }}
          />
          <span className="truncate font-mono font-semibold text-[12px] text-foreground">
            {item.name}
          </span>
        </div>
        <div className="mt-0.5 text-[10.5px] text-foreground-muted">
          {type} · {fmtNum(item.callCount)} calls
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium font-mono text-[11px] text-foreground">
          {item.errorRate.toFixed(2)}%
        </div>
        <span className="text-[9.5px] text-foreground-muted">err rate</span>
      </div>
    </button>
  );
}
