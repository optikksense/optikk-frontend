import { memo } from "react";

import { cn } from "@/lib/utils";

import type { Tone } from "../view-models/saturationScore";

export type RankBarRowProps = {
  primary: string;
  secondary?: string;
  meta?: string;
  bar: number;
  barLabel: string;
  tone: Tone;
  onClick?: () => void;
};

function toneRowClass(tone: Tone): string {
  if (tone === "err") return "is-err";
  if (tone === "warn") return "is-warn";
  return "";
}

function fillToneClass(tone: Tone): string {
  if (tone === "err") return "bg-[var(--color-error)]";
  if (tone === "warn") return "bg-[var(--color-warning)]";
  return "bg-[var(--color-success)]";
}

function RankBarRowImpl(props: RankBarRowProps): JSX.Element {
  const { primary, secondary, meta, bar, barLabel, tone, onClick } = props;
  const widthPct = Math.max(0, Math.min(100, bar * 100));
  return (
    <tr className={toneRowClass(tone)} onClick={onClick}>
      <td className="strong">{primary}</td>
      <td className="dim">{secondary ?? ""}</td>
      <td className="dim">{meta ?? ""}</td>
      <td style={{ minWidth: 160 }}>
        <div className="relative h-2 min-w-[80px] overflow-hidden rounded bg-[var(--bg-2)]">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-[250ms]",
              fillToneClass(tone)
            )}
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </td>
      <td className="num">{barLabel}</td>
    </tr>
  );
}

export const RankBarRow = memo(RankBarRowImpl);
