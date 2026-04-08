import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BoardExportMenuProps {
  entityName: string;
  rowsLength: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.rowsLength
 * @param root0.onExportCSV
 * @param root0.onExportJSON
 */
export default function BoardExportMenu({
  entityName,
  rowsLength,
  onExportCSV,
  onExportJSON,
}: BoardExportMenuProps) {
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
        disabled={rowsLength === 0}
        onClick={() => setOpen((o) => !o)}
      >
        <Download size={13} /> Export
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 min-w-[160px] rounded-lg border border-border bg-secondary p-2 shadow-lg">
          <div className="px-2 pb-2 font-semibold text-[13px] text-[color:var(--text-secondary)]">
            Export {entityName}s
          </div>
          <div className="flex flex-col gap-1.5 py-1">
            <button
              type="button"
              className="inline-flex h-[30px] w-full cursor-pointer items-center justify-start gap-1.5 whitespace-nowrap rounded-[7px] border border-[color:var(--glass-border)] bg-transparent px-3 py-[5px] font-medium text-[color:var(--text-secondary)] text-xs transition-all duration-150 hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                onExportCSV();
                setOpen(false);
              }}
              disabled={rowsLength === 0}
            >
              Export as CSV
            </button>
            <button
              type="button"
              className="inline-flex h-[30px] w-full cursor-pointer items-center justify-start gap-1.5 whitespace-nowrap rounded-[7px] border border-[color:var(--glass-border)] bg-transparent px-3 py-[5px] font-medium text-[color:var(--text-secondary)] text-xs transition-all duration-150 hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                onExportJSON();
                setOpen(false);
              }}
              disabled={rowsLength === 0}
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
