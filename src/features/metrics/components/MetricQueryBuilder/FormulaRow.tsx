import { Calculator, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

import { QUERY_LABELS } from '../../constants';

interface FormulaRowProps {
  readonly id: string;
  readonly expression: string;
  readonly activeQueryIds: string[];
  readonly onExpressionChange: (expression: string) => void;
  readonly onRemove: () => void;
}

const FORMULA_COLOR = '#f59e0b';

function validateExpression(expr: string, activeIds: string[]): string | null {
  if (!expr.trim()) return null;
  const activeSet = new Set(activeIds);
  const tokens = expr.match(/[a-zA-Z]+|[0-9.]+|[+\-*/()]/g);
  if (!tokens) return 'Invalid expression';

  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      if (!QUERY_LABELS.includes(token as (typeof QUERY_LABELS)[number])) {
        return `Unknown label: ${token}`;
      }
      if (!activeSet.has(token)) {
        return `Query "${token}" has no metric selected`;
      }
    }
  }
  return null;
}

export function FormulaRow({
  id,
  expression,
  activeQueryIds,
  onExpressionChange,
  onRemove,
}: FormulaRowProps) {
  const [focused, setFocused] = useState(false);
  const error = useMemo(
    () => validateExpression(expression, activeQueryIds),
    [expression, activeQueryIds]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onExpressionChange(e.target.value);
    },
    [onExpressionChange]
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2 min-h-[48px]',
        'transition-colors duration-150',
        focused
          ? 'border-[rgba(245,158,11,0.45)] bg-[rgba(245,158,11,0.06)]'
          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[rgba(148,163,184,0.25)]'
      )}
    >
      {/* Formula label */}
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ backgroundColor: FORMULA_COLOR }}
      >
        <Calculator size={12} />
      </div>

      {/* Formula input */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] shrink-0">
            Formula
          </span>
          <input
            type="text"
            value={expression}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. a / b * 100"
            className={cn(
              'h-7 flex-1 rounded-md border bg-[var(--bg-tertiary)] px-2',
              'font-mono text-[12px] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)] outline-none',
              'transition-colors duration-150',
              error
                ? 'border-[rgba(240,68,56,0.4)]'
                : 'border-[var(--border-color)] focus:border-[rgba(245,158,11,0.45)]'
            )}
          />
        </div>
        {error && (
          <span className="text-[10px] text-[var(--color-error)] pl-[52px]">{error}</span>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 hover:bg-[var(--bg-hover)] transition-all duration-100"
      >
        <X size={14} className="text-[var(--text-muted)]" />
      </button>
    </div>
  );
}
