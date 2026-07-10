import { useNavigate } from "@tanstack/react-router";
import { Waypoints } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly traceId: string | null;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}

function LogDetailFooterComponent({ traceId, onPrev, onNext }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        disabled={!onPrev}
        onClick={onPrev}
        className="inline-flex h-[30px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[var(--line)] bg-[var(--bg-card)] px-2.5 text-[12px] text-[var(--fg-1)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Prev
      </button>
      <button
        type="button"
        disabled={!onNext}
        onClick={onNext}
        className="inline-flex h-[30px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[var(--line)] bg-[var(--bg-card)] px-2.5 text-[12px] text-[var(--fg-1)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
      {traceId && (
        <button
          type="button"
          onClick={() => navigate({ to: `/traces/${encodeURIComponent(traceId)}` })}
          className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--accent)] px-3 text-[12px] text-[var(--accent-fg,oklch(0.99_0.005_270))] hover:bg-[var(--accent-2)]"
        >
          <Waypoints size={13} /> Open trace
        </button>
      )}
    </>
  );
}

export const LogDetailFooter = memo(LogDetailFooterComponent);
