import { Search } from "lucide-react";

import type { NodeFilterState } from "../utils/filterNodes";
import type { NodeHealthTier } from "../utils/nodeHealth";

interface InfraHostsFilterBarProps {
  readonly value: NodeFilterState;
  readonly serviceOptions: readonly string[];
  readonly onChange: (next: NodeFilterState) => void;
}

const TIER_CHIPS: ReadonlyArray<{ tier: NodeHealthTier; label: string; dot: string }> = [
  { tier: "healthy", label: "Healthy", dot: "bg-success" },
  { tier: "degraded", label: "Degraded", dot: "bg-warning" },
  { tier: "unhealthy", label: "Alerting", dot: "bg-error" },
];

function toggleTier(
  tiers: ReadonlySet<NodeHealthTier>,
  tier: NodeHealthTier
): ReadonlySet<NodeHealthTier> {
  const next = new Set(tiers);
  if (next.has(tier)) next.delete(tier);
  else next.add(tier);
  return next;
}

function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
      <Search size={14} className="text-foreground-muted" />
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Filter hosts by name or service…"
        className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none"
      />
    </div>
  );
}

function TierChips({
  tiers,
  onToggle,
}: {
  tiers: ReadonlySet<NodeHealthTier>;
  onToggle: (tier: NodeHealthTier) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {TIER_CHIPS.map((chip) => {
        const active = tiers.has(chip.tier);
        return (
          <button
            key={chip.tier}
            type="button"
            onClick={() => onToggle(chip.tier)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${
              active
                ? "border-primary bg-[var(--color-primary-subtle-12)] text-foreground"
                : "border-border text-foreground-muted hover:text-foreground"
            }`}
            aria-pressed={active}
          >
            <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${chip.dot}`} />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

function ServiceSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-foreground outline-none"
      aria-label="Filter by service"
    >
      <option value="">All services</option>
      {options.map((svc) => (
        <option key={svc} value={svc}>
          {svc}
        </option>
      ))}
    </select>
  );
}

export function InfraHostsFilterBar({
  value,
  serviceOptions,
  onChange,
}: InfraHostsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBox value={value.search} onChange={(search) => onChange({ ...value, search })} />
      <TierChips
        tiers={value.tiers}
        onToggle={(tier) => onChange({ ...value, tiers: toggleTier(value.tiers, tier) })}
      />
      <ServiceSelect
        value={value.service}
        options={serviceOptions}
        onChange={(service) => onChange({ ...value, service })}
      />
    </div>
  );
}
