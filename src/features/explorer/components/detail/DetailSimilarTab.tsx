import { memo, type ReactNode } from "react";

export interface SimilarItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
}

interface Props {
  readonly items?: readonly SimilarItem[];
  readonly onSelect?: (id: string) => void;
  readonly emptyState?: ReactNode;
}

function DetailSimilarTabComponent({ items, onSelect, emptyState }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-[12px] text-[var(--text-muted)]">
        {emptyState ?? <span>No similar events found</span>}
      </div>
    );
  }
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect?.(item.id)}
            className="flex w-full flex-col items-start gap-0.5 border-b border-[var(--border-color)] px-2 py-2 text-left text-[12px] hover:bg-[rgba(255,255,255,0.04)]"
          >
            <span className="truncate text-[var(--text-primary)]">{item.title}</span>
            {item.subtitle ? (
              <span className="truncate text-[11px] text-[var(--text-muted)]">{item.subtitle}</span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const DetailSimilarTab = memo(DetailSimilarTabComponent);
