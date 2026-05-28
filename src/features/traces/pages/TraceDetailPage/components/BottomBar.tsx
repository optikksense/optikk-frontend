import { memo } from "react";

interface Props {
  readonly traceId: string;
  readonly spanCount: number;
  readonly serviceCount: number;
  readonly environment?: string;
}

const botK = "text-[var(--text-caption)]";
const botV = "text-[var(--text-secondary)] font-mono";
const botSep = "text-[var(--text-caption)] opacity-50";
const kbd =
  "inline-grid place-items-center min-w-[16px] h-[16px] px-1 font-mono text-[9.5px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-[4px]";
const kbdHint = "inline-flex gap-1 items-center";

function BottomBarComponent({ traceId, spanCount, serviceCount, environment }: Props) {
  return (
    <div className="flex items-center justify-between h-[28px] px-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-caption)] flex-shrink-0">
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
