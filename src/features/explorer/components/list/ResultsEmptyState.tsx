import { Inbox } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly title?: string;
  readonly description?: string;
}

function ResultsEmptyStateComponent({
  title = "No results",
  description = "Adjust filters or broaden the time range.",
}: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <Inbox size={28} className="text-[var(--text-muted)]" />
      <span className="text-[13px] font-medium text-[var(--text-primary)]">{title}</span>
      <span className="max-w-sm text-[12px] text-[var(--text-muted)]">{description}</span>
    </div>
  );
}

export const ResultsEmptyState = memo(ResultsEmptyStateComponent);
