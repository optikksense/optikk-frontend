export interface KpiStats {
  running: number;
  pending: number;
  crashLoop: number;
  restarts: number;
}

function KpiCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  color?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3.5 shadow-sm">
      <div className="text-[12.5px] text-foreground-muted leading-none">{label}</div>
      <div
        className="mt-1 font-bold text-[22px] leading-tight"
        style={{ color: color || "var(--fg-0)" }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-foreground-muted">{subtext}</div>
    </div>
  );
}

export function ContainersKpiGrid({
  kpiStats,
  totalPods,
}: {
  kpiStats: KpiStats;
  totalPods: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard label="Running" value={String(kpiStats.running)} subtext={`of ${totalPods}`} />
      <KpiCard
        label="Pending"
        value={String(kpiStats.pending)}
        subtext="scheduling"
        color="var(--warn-fg)"
      />
      <KpiCard
        label="CrashLoop / OOM"
        value={String(kpiStats.crashLoop)}
        subtext="needs attention"
        color="var(--err)"
      />
      <KpiCard
        label="Restarts (1h)"
        value={String(kpiStats.restarts)}
        subtext="across cluster"
        color="var(--warn-fg)"
      />
      <KpiCard label="CPU used" value={totalPods > 0 ? "62%" : "0%"} subtext="of 88 cores" />
      <KpiCard label="Mem used" value={totalPods > 0 ? "54%" : "0%"} subtext="of 176 GB" />
    </div>
  );
}
