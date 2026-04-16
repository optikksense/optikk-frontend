import { Database, Download, List, RotateCcw, Share2 } from "lucide-react";
import { memo } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui";

import type { LlmGenerationRecord } from "../../../types";
import { downloadGenerationsAsJson } from "../../../utils/exportGenerationsJson";

type Props = {
  generations: LlmGenerationRecord[];
  onOpenDataset: () => void;
  onReset: () => void;
};

function LlmGenerationsHeaderComponent({ generations, onOpenDataset, onReset }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
        <List size={16} className="text-[var(--text-muted)]" />
        Generations
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<Download size={14} />}
          onClick={() => {
            downloadGenerationsAsJson(generations);
            toast.success("Downloaded JSON for rows in this page");
          }}
        >
          Export JSON
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Database size={14} />}
          disabled={generations.length === 0}
          onClick={onOpenDataset}
        >
          Save as dataset
        </Button>
        <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={onReset}>
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Share2 size={14} />}
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Share link copied");
          }}
        >
          Share
        </Button>
      </div>
    </div>
  );
}

export const LlmGenerationsHeader = memo(LlmGenerationsHeaderComponent);
