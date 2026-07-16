import type { HostOverview } from "../../api/hostDetailApi";

interface HostDetailKpiCardsProps {
  readonly overview: HostOverview | null;
}

type Tone = "ok" | "warn" | "err" | "neutral";

const VALUE_TONE: Record<Tone, string> = {
  ok: "text-foreground",
  warn: "text-warning",
  err: "text-error",
  neutral: "text-foreground-muted",
};

function percentTone(v: number, warnAt: number, errAt: number): Tone {
  if (v >= errAt) return "err";
  if (v >= warnAt) return "warn";
  return "ok";
}

interface KpiTileProps {
  readonly label: string;
  readonly value: string;
  readonly tone: Tone;
  readonly hint?: string;
}

function KpiTile({ label, value, tone, hint }: KpiTileProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-3">
      <div className="text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">{label}</div>
      <div className={`font-semibold text-[28px] leading-none ${VALUE_TONE[tone]}`}>{value}</div>
      {hint && <div className="text-[11px] text-foreground-muted">{hint}</div>}
    </div>
  );
}

function pctTile(label: string, v: number | null, warnAt: number, errAt: number): KpiTileProps {
  if (v == null) return { label, value: "—", tone: "neutral", hint: "not reported" };
  return { label, value: `${v.toFixed(0)}%`, tone: percentTone(v, warnAt, errAt) };
}

export function HostDetailKpiCards({ overview }: HostDetailKpiCardsProps) {
  const tiles: KpiTileProps[] = [
    pctTile("CPU", overview?.cpu_pct ?? null, 75, 90),
    pctTile("Memory", overview?.memory_pct ?? null, 80, 90),
    pctTile("Disk (max volume)", overview?.disk_pct ?? null, 80, 90),
    overview?.load_1m != null
      ? { label: "Load (1m)", value: overview.load_1m.toFixed(2), tone: "ok" }
      : { label: "Load (1m)", value: "—", tone: "neutral", hint: "not reported" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <KpiTile key={t.label} {...t} />
      ))}
    </div>
  );
}
