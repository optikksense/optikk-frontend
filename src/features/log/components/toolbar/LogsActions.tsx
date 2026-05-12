import { Bookmark, Download, Link2 } from "lucide-react";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

import { SavedViewsDropdown } from "@/features/savedViews/components/SavedViewsDropdown";

interface Props {
  readonly onLoadSavedView: (url: string) => void;
}

/** Action buttons: Saved Views, Share permalink, Export. */
function LogsActionsComponent({ onLoadSavedView }: Props) {
  const onShare = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  return (
    <>
      <SavedViewsDropdown scope="logs" onLoad={onLoadSavedView} />
      <button
        type="button"
        onClick={onShare}
        title="Copy link"
        className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      >
        <Link2 size={13} />
        Share
      </button>
    </>
  );
}

export const LogsActions = memo(LogsActionsComponent);
