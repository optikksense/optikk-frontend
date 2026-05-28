import { memo } from "react";

import type { SubsystemCardSpec } from "../view-models/subsystemSpecs";
import { Sparkline } from "./Sparkline";
import { StatusChip } from "./StatusChip";
import { SubsystemIcon } from "./SubsystemIcon";

type Props = {
  spec: SubsystemCardSpec;
};

function SubsystemCardImpl({ spec }: Props): JSX.Element {
  return (
    <a className="sat-kpi" href={spec.href} aria-label={`${spec.label} subsystem`}>
      <div className="sat-kpi-head">
        <span className="sat-kpi-icon">
          <SubsystemIcon name={spec.iconName} />
        </span>
        <span className="sat-kpi-label">{spec.label}</span>
        <span style={{ marginLeft: "auto" }}>
          <StatusChip tone={spec.tone} text={spec.statusText} size="sm" />
        </span>
      </div>
      <div className="sat-kpi-sub">{spec.sub}</div>
      <div className="sat-kpi-primary">{spec.primary}</div>
      <div className="sat-kpi-secondary">{spec.secondary}</div>
      <Sparkline series={spec.series} ariaLabel={`${spec.label} trend`} />
    </a>
  );
}

export const SubsystemCard = memo(SubsystemCardImpl);
