import { Share2 } from "lucide-react";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

/** Action buttons: Share (copy link). */
function LogsActionsComponent() {
  const onShare = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  return (
    <button
      type="button"
      onClick={onShare}
      className="group inline-flex h-[38px] cursor-pointer items-center gap-[7px] rounded-[7px] border border-[var(--line)] bg-[var(--bg-1)] px-[14px] text-[13px] text-[var(--fg-0)] hover:bg-[var(--bg-2)]"
      title="Copy link"
    >
      <span className="inline-flex text-[var(--fg-2)] group-hover:text-[var(--fg-0)]">
        <Share2 size={14} />
      </span>
      Share
    </button>
  );
}

export const LogsActions = memo(LogsActionsComponent);
