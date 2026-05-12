import { Share2 } from "lucide-react";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

import { SavedViewsDropdown } from "@/features/savedViews/components/SavedViewsDropdown";

interface Props {
  readonly onLoadSavedView: (url: string) => void;
}

/** Action buttons: Saved Views (existing dropdown) and Share (copy link). */
function LogsActionsComponent({ onLoadSavedView }: Props) {
  const onShare = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  return (
    <>
      <SavedViewsDropdown scope="logs" onLoad={onLoadSavedView} />
      <button type="button" onClick={onShare} className="ok-btn" title="Copy link">
        <span className="ok-btn-i">
          <Share2 size={14} />
        </span>
        Share
      </button>
    </>
  );
}

export const LogsActions = memo(LogsActionsComponent);
