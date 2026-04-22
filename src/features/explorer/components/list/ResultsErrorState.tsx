import { AlertTriangle, RotateCcw } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly title?: string;
  readonly message?: string;
  readonly onRetry?: () => void;
}

function ResultsErrorStateComponent({
  title = "Couldn't load results",
  message,
  onRetry,
}: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <AlertTriangle size={28} className="text-[var(--danger)]" />
      <span className="text-[13px] font-medium text-[var(--text-primary)]">{title}</span>
      {message ? (
        <span className="max-w-md text-[12px] text-[var(--text-muted)]">{message}</span>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-[12px] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)]"
        >
          <RotateCcw size={12} />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export const ResultsErrorState = memo(ResultsErrorStateComponent);
