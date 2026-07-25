import { memo } from "react";

interface Props {
  readonly traceId: string;
  readonly spanCount: number;
  readonly serviceCount: number;
}

const kbd =
  "inline-grid place-items-center min-w-[16px] h-[16px] px-1 font-mono text-[10px] text-foreground-muted bg-muted border border-border rounded-[4px]";

function BottomBarComponent({ traceId, spanCount, serviceCount }: Props) {
  return (
    <footer className="flex items-center justify-between gap-4 border-border border-t bg-background px-4 py-2 text-[11px] text-foreground-caption">
      <div className="flex items-center gap-3">
        <span>
          Trace: <code className="font-mono text-foreground-secondary">{traceId}</code>
        </span>
        <span>·</span>
        <span>
          {spanCount} spans across {serviceCount} service{serviceCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-foreground-muted">
        <span className="inline-flex items-center gap-1">
          <kbd className={kbd}>1</kbd>-<kbd className={kbd}>4</kbd> switch view
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <kbd className={kbd}>/</kbd> search
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <kbd className={kbd}>Esc</kbd> close drawer
        </span>
      </div>
    </footer>
  );
}

export const BottomBar = memo(BottomBarComponent);
