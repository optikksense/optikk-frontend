import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyTip {
  num?: number;
  text: ReactNode;
}

interface BoardEmptyStateProps {
  entityName: string;
  tips: EmptyTip[];
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.tips
 */
export default function BoardEmptyState({ entityName, tips }: BoardEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-[60px] text-center">
      <div className="mb-[18px] text-muted-foreground opacity-25">
        <Search size={44} strokeWidth={1} />
      </div>
      <div className="mb-1.5 font-semibold text-[15px] text-foreground">No {entityName}s found</div>
      <div className="mb-5 max-w-[360px] text-[13px] text-muted-foreground leading-[1.6]">
        No {entityName}s matched your current filters and time range.
      </div>
      <div className="flex max-w-[320px] flex-col gap-2 text-left">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-[10px] text-[12.5px] text-[color:var(--text-secondary)] leading-[1.5]"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-bold text-[11px] text-primary">
              {tip.num ?? index + 1}
            </span>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
