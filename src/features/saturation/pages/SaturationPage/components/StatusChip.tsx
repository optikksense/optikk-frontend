import { memo } from "react";

import type { Tone } from "../view-models/saturationScore";

type Props = {
  tone: Tone;
  text: string;
  size?: "md" | "sm";
};

function StatusChipImpl({ tone, text, size = "md" }: Props): JSX.Element {
  const sizeClass = size === "sm" ? " is-sm" : "";
  return (
    <span className={`sat-status-chip sat-status-chip-${tone}${sizeClass}`}>
      <span className="sat-status-chip-d" />
      {text}
    </span>
  );
}

export const StatusChip = memo(StatusChipImpl);
