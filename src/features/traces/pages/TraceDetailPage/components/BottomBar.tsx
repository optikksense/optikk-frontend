import { memo } from "react";

interface Props {
  readonly traceId: string;
  readonly spanCount: number;
  readonly serviceCount: number;
  readonly environment?: string;
}

const botK = "text-foreground-caption";
const botV = "text-foreground-secondary font-mono";
const botSep = "text-foreground-caption opacity-50";
const kbd =
  "inline-grid place-items-center min-w-[16px] h-[16px] px-1 font-mono text-[9.5px] text-foreground-muted bg-muted border border-border rounded-[4px]";
const kbdHint = "inline-flex gap-1 items-center";

function BottomBarComponent({ traceId, spanCount, serviceCount, environment }: Props) {
  return (
    <div className="flex items-center justify-between h-[28px] px-4 bg-secondary border-t border-border text-[11px] text-foreground-caption flex-shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={botK}>trace</span>
        <span className={botV}>{traceId.slice(0, 16)}…</span>
        <span className={botSep}>·</span>
        <span className={botK}>spans</span>
        <span className={botV}>{spanCount}</span>
        <span className={botSep}>·</span>
        <span className={botK}>services</span>
        <span className={botV}>{serviceCount}</span>
        {environment && (
          <>
            <span className={botSep}>·</span>
            <span className={botK}>env</span>
            <span className={botV}>{environment}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={kbdHint}>
          <kbd className={kbd}>j</kbd>
          <kbd className={kbd}>k</kbd> navigate
        </span>
        <span className={kbdHint}>
          <kbd className={kbd}>/</kbd> filter
        </span>
        <span className={kbdHint}>
          <kbd className={kbd}>esc</kbd> close panel
        </span>
      </div>
    </div>
  );
}

export const BottomBar = memo(BottomBarComponent);
