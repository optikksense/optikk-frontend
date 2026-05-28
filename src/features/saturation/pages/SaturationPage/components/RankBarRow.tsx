import { memo } from "react";

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

function toneClass(tone: Tone): string {
  if (tone === "err") return " is-err";
  if (tone === "warn") return " is-warn";
  return "";
}

function fillClass(tone: Tone): string {
  if (tone === "err") return "sat-lagbar-f is-err";
  if (tone === "warn") return "sat-lagbar-f is-warn";
  return "sat-lagbar-f";
}

function RankBarRowImpl(props: RankBarRowProps): JSX.Element {
  const { primary, secondary, meta, bar, barLabel, tone, onClick } = props;
  const widthPct = Math.max(0, Math.min(100, bar * 100));
  return (
    <tr className={toneClass(tone)} onClick={onClick}>
      <td className="strong">{primary}</td>
      <td className="dim">{secondary ?? ""}</td>
      <td className="dim">{meta ?? ""}</td>
      <td style={{ minWidth: 160 }}>
        <div className="sat-lagbar">
          <div className={fillClass(tone)} style={{ width: `${widthPct}%` }} />
        </div>
      </td>
      <td className="num">{barLabel}</td>
    </tr>
  );
}

export const RankBarRow = memo(RankBarRowImpl);
