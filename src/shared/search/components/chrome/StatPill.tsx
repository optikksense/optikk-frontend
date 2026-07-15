import { memo } from "react";

export interface StatPillProps {
  label: string;
  value: string;
  dot?: string;
}

function StatPillComponent({ label, value, dot }: StatPillProps) {
  return (
    <div className="flex flex-row items-center gap-2 h-8 px-[14px] rounded-full border border-border bg-card">
      {dot ? <span style={{ backgroundColor: dot }} className="h-2 w-2 rounded-full shrink-0" /> : null}
      <span className="font-bold text-[11px] text-foreground-muted uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="font-bold text-[15px] text-foreground">{value}</span>
    </div>
  );
}

export const StatPill = memo(StatPillComponent);
