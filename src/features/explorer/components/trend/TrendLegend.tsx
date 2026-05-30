import { RotateCcw } from "lucide-react";
import { memo } from "react";

export interface TrendLegendItem {
  readonly key: string;
  readonly label: string;
  readonly color: string;
}

interface Props {
  readonly items: readonly TrendLegendItem[];
  readonly zoomed?: boolean;
  readonly onResetZoom?: () => void;
}

function TrendLegendComponent({ items, zoomed, onResetZoom }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 text-[11px] text-foreground-secondary">
      <div className="flex items-center gap-3">
        {items.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
      {zoomed && onResetZoom ? (
        <button
          type="button"
          onClick={onResetZoom}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-foreground-secondary hover:bg-accent hover:text-foreground"
        >
          <RotateCcw size={11} />
          Reset zoom
        </button>
      ) : null}
    </div>
  );
}

export const TrendLegend = memo(TrendLegendComponent);
