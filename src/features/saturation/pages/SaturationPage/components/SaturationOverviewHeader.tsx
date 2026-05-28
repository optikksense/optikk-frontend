import { Grid3x3 } from "lucide-react";
import { memo } from "react";

import type { OverviewSummary } from "../view-models/subsystemSpecs";
import { StatusChip } from "./StatusChip";

type Props = {
  summary: OverviewSummary;
};

function SaturationOverviewHeaderImpl({ summary }: Props): JSX.Element {
  return (
    <header className="sat-head-top">
      <div className="sat-head-title">
        <div className="sat-head-icon">
          <Grid3x3 size={20} aria-hidden />
        </div>
        <div>
          <h1 className="sat-head-h1">Saturation</h1>
          <div className="sat-head-sub">{summary.subline}</div>
        </div>
        <StatusChip tone={summary.tone} text={summary.statusText} />
      </div>
    </header>
  );
}

export const SaturationOverviewHeader = memo(SaturationOverviewHeaderImpl);
