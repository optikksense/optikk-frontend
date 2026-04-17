import { memo } from "react";

import { toneFromDelta } from "../utils";

interface Props {
  delta: number;
  formatter: (value: number) => string;
  invert?: boolean;
}

function DeltaPillComponent({ delta, formatter, invert = false }: Props) {
  const effective = invert ? delta * -1 : delta;
  const tone = toneFromDelta(effective);
  const classes =
    tone === "negative"
      ? "border-[rgba(240,68,56,0.25)] bg-[rgba(240,68,56,0.12)] text-[var(--color-error)]"
      : tone === "positive"
        ? "border-[rgba(115,201,145,0.25)] bg-[rgba(115,201,145,0.12)] text-[var(--color-success)]"
        : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]";
  const prefix = delta > 0 ? "+" : "";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium text-[11px] ${classes}`}
    >
      {prefix}
      {formatter(delta)}
    </span>
  );
}

export const DeltaPill = memo(DeltaPillComponent);
