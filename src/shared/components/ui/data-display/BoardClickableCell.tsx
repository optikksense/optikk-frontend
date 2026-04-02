import { Filter } from 'lucide-react';
import type { ReactNode, CSSProperties } from 'react';

export type BoardFilterValue = string | number | boolean;

export interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: 'equals';
}

function isFilterValue(value: unknown): value is BoardFilterValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export interface BoardClickableCellProps {
  field: string;
  value?: BoardFilterValue | null;
  onAddFilter?: (filter: BoardFilter) => void;
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Clickable cell wrapper that emits an equals filter for the wrapped value.
 * @param props Cell props.
 * @returns Filterable or plain cell wrapper.
 */
export function BoardClickableCell({
  field,
  value,
  onAddFilter,
  children,
  style = {},
}: BoardClickableCellProps): JSX.Element {
  if (!onAddFilter || !isFilterValue(value) || value === '' || value === '-') {
    return <span style={style}>{children}</span>;
  }

  return (
    <span
      className="group inline-flex items-center gap-1 cursor-pointer rounded-sm px-[2px] py-[1px] transition-colors duration-100 hover:bg-[var(--color-primary-subtle-12)]"
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onAddFilter({ field, value, operator: 'equals' });
      }}
      title={`Filter: ${field} = "${String(value)}"`}
    >
      {children}
      <Filter
        size={10}
        className="opacity-0 group-hover:opacity-100 text-primary shrink-0 transition-opacity duration-100"
      />
    </span>
  );
}
