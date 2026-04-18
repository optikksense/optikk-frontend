import { Surface } from "@/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { useApdex } from "./useApdex";

interface ApdexCardProps {
  readonly serviceName: string;
}

function apdexTone(value: number | null): string {
  if (value == null) return "text-[var(--text-muted)]";
  if (value >= 0.94) return "text-[var(--color-success)]";
  if (value >= 0.85) return "text-[var(--color-warning)]";
  return "text-[var(--color-error)]";
}

function BreakdownLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--text-primary)]">{formatNumber(value)}</span>
    </div>
  );
}

export default function ApdexCard({ serviceName }: ApdexCardProps) {
  const { summary } = useApdex(serviceName);
  const apdex = summary?.apdex ?? null;
  const display = apdex == null ? "—" : apdex.toFixed(2);

  return (
    <Surface elevation={1} padding="sm" className="flex h-full flex-col gap-2">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Apdex score
      </span>
      <div className={`font-semibold text-[28px] leading-none ${apdexTone(apdex)}`}>{display}</div>
      <div className="mt-1 flex flex-col gap-1">
        <BreakdownLine label="Satisfied" value={summary?.satisfied ?? 0} />
        <BreakdownLine label="Tolerating" value={summary?.tolerating ?? 0} />
        <BreakdownLine label="Frustrated" value={summary?.frustrated ?? 0} />
      </div>
    </Surface>
  );
}
