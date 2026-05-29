import { formatPercentage, normalizePercentage } from "@shared/utils/formatters";
import type { LucideIcon } from "lucide-react";

import type { InfraTopHost } from "../types";

interface InfraTopConsumersPanelProps {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly hosts: readonly InfraTopHost[];
  readonly isPending: boolean;
  readonly onOpenHost: (host: string) => void;
}

function usageBarColor(percent: number): string {
  if (percent >= 90) return "var(--color-error)";
  if (percent >= 75) return "var(--color-warning)";
  return "var(--color-primary)";
}

function TopConsumerRow({
  host,
  onOpenHost,
}: {
  readonly host: InfraTopHost;
  readonly onOpenHost: (host: string) => void;
}) {
  const percent = normalizePercentage(host.value);
  const barWidth = Math.max(percent, 2);
  return (
    <button
      type="button"
      onClick={() => onOpenHost(host.host)}
      className="flex w-full flex-col gap-1 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">
          {host.host}
        </span>
        <span className="flex-none font-mono text-[11.5px] text-[var(--text-secondary)]">
          {formatPercentage(host.value, 0)}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
        <div
          style={{ width: `${barWidth}%`, backgroundColor: usageBarColor(percent) }}
          className="h-full rounded-full"
        />
      </div>
    </button>
  );
}

/**
 * Ranked side card listing the hosts that consume the most of a single resource
 * (CPU or memory), each row a host name + proportional usage bar. Rows link to
 * the host detail route via `onOpenHost`, consistent with the hosts table.
 */
export function InfraTopConsumersPanel({
  title,
  icon: Icon,
  hosts,
  isPending,
  onOpenHost,
}: InfraTopConsumersPanelProps) {
  return (
    <section className="flex flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
      <header className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-caption)]">
        <Icon size={13} className="text-[var(--text-muted)]" />
        {title}
      </header>
      {hosts.length === 0 ? (
        <div className="grid h-[120px] place-items-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No data"}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {hosts.map((host) => (
            <TopConsumerRow key={host.host} host={host} onOpenHost={onOpenHost} />
          ))}
        </div>
      )}
    </section>
  );
}
