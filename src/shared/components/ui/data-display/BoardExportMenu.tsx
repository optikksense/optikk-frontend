import { Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-[7px] border border-[color:var(--glass-border)] bg-transparent text-[color:var(--text-secondary)] text-xs font-medium cursor-pointer transition-all duration-150 h-[30px] whitespace-nowrap hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={rowsLength === 0}
        onClick={() => setOpen((o) => !o)}
      >
        <Download size={13} /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 bg-secondary border border-border rounded-lg p-2 min-w-[160px] shadow-lg">
          <div className="px-2 pb-2 font-semibold text-[13px] text-[color:var(--text-secondary)]">
            Export {entityName}s
          </div>
          <div className="flex flex-col gap-1.5 py-1">
            <button
              className="inline-flex items-center justify-start gap-1.5 px-3 py-[5px] rounded-[7px] border border-[color:var(--glass-border)] bg-transparent text-[color:var(--text-secondary)] text-xs font-medium cursor-pointer transition-all duration-150 h-[30px] whitespace-nowrap w-full hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => {
                onExportCSV();
                setOpen(false);
              }}
              disabled={rowsLength === 0}
            >
              Export as CSV
            </button>
            <button
              className="inline-flex items-center justify-start gap-1.5 px-3 py-[5px] rounded-[7px] border border-[color:var(--glass-border)] bg-transparent text-[color:var(--text-secondary)] text-xs font-medium cursor-pointer transition-all duration-150 h-[30px] whitespace-nowrap w-full hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
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
