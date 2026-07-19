import { memo } from "react";

export interface StatPillProps {
  label: string;
  value: string;
  dot?: string;
}

function StatPillComponent({ label, value, dot }: StatPillProps) {
  return (
    <div className="flex h-8 flex-row items-center gap-2 rounded-full border border-border bg-card px-[14px]">
      {dot ? (
        <span style={{ backgroundColor: dot }} className="h-2 w-2 shrink-0 rounded-full" />
      ) : null}
      <span className="font-bold text-[11px] text-foreground-muted uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="font-bold text-[15px] text-foreground">{value}</span>
    </div>
  );
}

export const StatPill = memo(StatPillComponent);
