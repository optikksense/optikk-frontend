import { Check, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BoardColumnSettingsPopoverProps {
  columns: Array<{ key: string; label: string }>;
  visibleCols: Record<string, boolean>;
  onToggle: (columnKey: string) => void;
}

/**
 *
 * @param root0
 * @param root0.columns
 * @param root0.visibleCols
 * @param root0.onToggle
 */
export default function BoardColumnSettingsPopover({
  columns,
  visibleCols,
  onToggle,
}: BoardColumnSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] border border-[color:var(--glass-border)] bg-transparent px-3 py-[5px] font-medium text-[color:var(--text-secondary)] text-xs transition-all duration-150 hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => setOpen((o) => !o)}
      >
        <Settings2 size={13} /> Columns
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 min-w-[180px] rounded-lg border border-border bg-secondary py-2 shadow-lg">
          <div className="px-3 pb-2 font-semibold text-[13px] text-[color:var(--text-secondary)]">
            Columns
          </div>
          <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto px-0 py-1">
            {columns.map((column) => {
              const checked = Boolean(visibleCols[column.key]);
              return (
                <div
                  key={column.key}
                  className={`flex cursor-pointer select-none items-center gap-2 rounded-[5px] px-1 py-[5px] text-[12.5px] text-[color:var(--text-secondary)] transition-colors duration-100 hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground ${
                    checked ? "text-foreground" : ""
                  }`}
                  onClick={() => onToggle(column.key)}
                >
                  <span
                    className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded border text-[9px] transition-all duration-[0.12s] ${
                      checked ? "border-primary bg-primary text-white" : "border-border"
                    }`}
                    style={{ borderWidth: "1.5px" }}
                  >
                    {checked ? <Check size={9} /> : null}
                  </span>
                  {column.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
