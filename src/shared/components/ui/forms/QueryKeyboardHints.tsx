import { EXPLORER_QUERY_HINTS_CLASSNAME } from "./explorerQueryShell";

/**
 *
 */
export default function QueryKeyboardHints() {
  return (
    <div className={EXPLORER_QUERY_HINTS_CLASSNAME}>
      {[
        ["Click / Focus", "Open field picker"],
        ["Tab", "Auto-select when 1 match"],
        ["Enter", "Commit value"],
        ["Backspace", "Step back / remove last filter"],
        ["Escape", "Close picker"],
      ].map(([shortcut, description]) => (
        <div
          key={shortcut}
          className="flex items-center gap-[10px] text-[11px] text-[color:var(--text-secondary)]"
        >
          <kbd className="inline-block min-w-[80px] whitespace-nowrap rounded border border-border bg-secondary px-[7px] py-[2px] text-center font-mono text-[10px] text-foreground">
            {shortcut}
          </kbd>
          <span>{description}</span>
        </div>
      ))}
    </div>
  );
}
