import { memo } from "react";

interface Props {
  readonly traceId: string;
  readonly spanCount: number;
  readonly serviceCount: number;
  readonly environment?: string;
}

function BottomBarComponent({ traceId, spanCount, serviceCount, environment }: Props) {
  return (
    <div className="tdp-botbar">
      <div className="tdp-botbar-l">
        <span className="tdp-bot-k">trace</span>
        <span className="tdp-bot-v">{traceId.slice(0, 16)}…</span>
        <span className="tdp-bot-sep">·</span>
        <span className="tdp-bot-k">spans</span>
        <span className="tdp-bot-v">{spanCount}</span>
        <span className="tdp-bot-sep">·</span>
        <span className="tdp-bot-k">services</span>
        <span className="tdp-bot-v">{serviceCount}</span>
        {environment && (
          <>
            <span className="tdp-bot-sep">·</span>
            <span className="tdp-bot-k">env</span>
            <span className="tdp-bot-v">{environment}</span>
          </>
        )}
      </div>
      <div className="tdp-botbar-r">
        <span className="tdp-kbdhint">
          <kbd className="tdp-kbd">j</kbd>
          <kbd className="tdp-kbd">k</kbd> navigate
        </span>
        <span className="tdp-kbdhint">
          <kbd className="tdp-kbd">/</kbd> filter
        </span>
        <span className="tdp-kbdhint">
          <kbd className="tdp-kbd">esc</kbd> close panel
        </span>
      </div>
    </div>
  );
}

export const BottomBar = memo(BottomBarComponent);
