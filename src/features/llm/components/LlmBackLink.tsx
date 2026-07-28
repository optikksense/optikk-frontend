import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { DEFAULT_LLM_TAB, type LlmTab } from "../pages/LlmPage/llmTabs";

interface LlmBackLinkProps {
  /** The LLM hub tab the user came from; back lands on that tab. */
  readonly tab: LlmTab;
}

export function LlmBackLink({ tab }: LlmBackLinkProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate({
          to: "/llm",
          search: (prev) => ({ ...prev, tab: tab === DEFAULT_LLM_TAB ? undefined : tab }),
        })
      }
      className="mb-3 inline-flex items-center gap-1 text-[12px] text-foreground-muted hover:text-foreground"
    >
      <ArrowLeft size={14} /> Back to LLM
    </button>
  );
}
