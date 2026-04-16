import { memo } from "react";

import { Button, Modal } from "@/components/ui";

type Props = {
  open: boolean;
  datasetName: string;
  onDatasetNameChange: (name: string) => void;
  onClose: () => void;
  savePending: boolean;
  saveDisabled: boolean;
  onSave: () => void;
  startTime: number;
  endTime: number;
};

function LlmGenerationsDatasetModalComponent({
  open,
  datasetName,
  onDatasetNameChange,
  onClose,
  savePending,
  saveDisabled,
  onSave,
  startTime,
  endTime,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save as dataset"
      width={440}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={saveDisabled}
            onClick={onSave}
          >
            {savePending ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
        Stores the current page of generations (without per-row estimated cost), the active explorer
        query string, and the explorer time bounds ({startTime}–{endTime} ms).
      </p>
      <label className="mt-3 flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-muted)]">Name</span>
        <input
          className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
          value={datasetName}
          onChange={(e) => onDatasetNameChange(e.target.value)}
          placeholder="e.g. eval-baseline-2026-04"
        />
      </label>
    </Modal>
  );
}

export const LlmGenerationsDatasetModal = memo(LlmGenerationsDatasetModalComponent);
