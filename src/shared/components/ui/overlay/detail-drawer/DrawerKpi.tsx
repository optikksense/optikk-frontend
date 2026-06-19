import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";

type SparkTone = "info" | "warn" | "err";

interface DrawerKpiProps {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly delta?: string;
  readonly deltaTone?: "up" | "down" | "warn";
  readonly spark?: number[];
  readonly sparkTone?: SparkTone;
}

const DELTA_COLOR: Record<NonNullable<DrawerKpiProps["deltaTone"]>, string> = {
  up: "var(--ok)",
  down: "var(--err)",
  warn: "var(--warn-fg)",
};

/** Compact KPI tile with a sparkline (design `DdKpi`). */
export function DrawerKpi({
  label,
  value,
  unit,
  delta,
  deltaTone,
  spark,
  sparkTone,
}: DrawerKpiProps) {
  return (
    <div className="rounded-lg border border-[var(--line-2)] bg-[var(--bg-card)] p-[12px_14px]">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[12.5px] text-[var(--fg-3)]">{label}</div>
        {delta ? (
          <span className="text-[12px]" style={{ color: DELTA_COLOR[deltaTone ?? "up"] }}>
            {delta}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <div className="font-semibold text-[22px] text-[var(--fg-0)] tabular-nums">{value}</div>
        {unit ? <div className="text-[12px] text-[var(--fg-3)]">{unit}</div> : null}
      </div>
      {spark && spark.length > 1 ? (
        <div className="mt-2">
          <SparklineCell values={spark} tone={sparkTone ?? "info"} width={220} height={26} />
        </div>
      ) : null}
    </div>
  );
}
