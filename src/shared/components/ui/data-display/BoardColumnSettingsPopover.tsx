import { Check, Settings2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-[7px] border border-[color:var(--glass-border)] bg-transparent text-[color:var(--text-secondary)] text-xs font-medium cursor-pointer transition-all duration-150 h-[30px] whitespace-nowrap hover:border-primary hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={() => setOpen((o) => !o)}
      >
        <Settings2 size={13} /> Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 bg-secondary border border-border rounded-lg py-2 min-w-[180px] shadow-lg">
          <div className="px-3 pb-2 font-semibold text-[13px] text-[color:var(--text-secondary)]">
            Columns
          </div>
          <div className="flex flex-col gap-2 py-1 px-0 max-h-[280px] overflow-y-auto">
            {columns.map((column) => {
              const checked = Boolean(visibleCols[column.key]);
              return (
                <div
                  key={column.key}
                  className={`flex items-center gap-2 px-1 py-[5px] rounded-[5px] cursor-pointer text-[12.5px] text-[color:var(--text-secondary)] transition-colors duration-100 select-none hover:bg-[var(--color-primary-subtle-08)] hover:text-foreground ${
                    checked ? 'text-foreground' : ''
                  }`}
                  onClick={() => onToggle(column.key)}
                >
                  <span
                    className={`w-[15px] h-[15px] rounded border flex items-center justify-center shrink-0 text-[9px] transition-all duration-[0.12s] ${
                      checked ? 'bg-primary border-primary text-white' : 'border-border'
                    }`}
                    style={{ borderWidth: '1.5px' }}
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
