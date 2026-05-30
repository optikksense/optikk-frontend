import { memo } from "react";

import type { SubsystemCardSpec } from "../view-models/subsystemSpecs";
import { StatusChip } from "./StatusChip";
import { SubsystemIcon } from "./SubsystemIcon";

type Props = {
  spec: SubsystemCardSpec;
};

function SubsystemCardImpl({ spec }: Props): JSX.Element {
  return (
    <a
      className="flex min-h-[152px] min-w-0 flex-col gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg-1)] px-5 py-[18px] text-inherit no-underline transition-[border-color] duration-150 hover:border-[var(--line-2)]"
      href={spec.href}
      aria-label={`${spec.label} subsystem`}
    >
      <div className="mb-1 flex items-center gap-[10px]">
        <span className="inline-grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-[var(--accent-bg)] text-[var(--color-primary)]">
          <SubsystemIcon name={spec.iconName} />
        </span>
        <span className="text-[14px] font-semibold text-[var(--fg-0)]">{spec.label}</span>
        <span className="ml-auto">
          <StatusChip tone={spec.tone} text={spec.statusText} size="sm" />
        </span>
      </div>
      <div className='font-["Geist_Mono",monospace] text-[11.5px] text-[var(--fg-3)]'>
        {spec.sub}
      </div>
      <div className='mt-[6px] font-["Geist_Mono",monospace] text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-0)]'>
        {spec.primary}
      </div>
      <div className='-mt-[2px] font-["Geist_Mono",monospace] text-[11.5px] text-[var(--fg-3)]'>
        {spec.secondary}
      </div>
    </a>
  );
}

export const SubsystemCard = memo(SubsystemCardImpl);
