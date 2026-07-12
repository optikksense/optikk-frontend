import { PageSurface, StatCard } from "@shared/components/ui";
import { ChevronRight } from "lucide-react";

import { categoryLabel, providerMeta } from "../../constants";
import type { CloudOverview, ProviderSummary } from "../../types";
import { HealthPills } from "./HealthPills";
import { ProviderMark } from "./ProviderMark";

interface AllCloudsViewProps {
  overview: CloudOverview;
  onOpenProvider: (provider: string) => void;
}

export function AllCloudsView({ overview, onOpenProvider }: AllCloudsViewProps): JSX.Element {
  const kpis = [
    { title: "Resources", value: overview.total_resources.toLocaleString() },
    { title: "Accounts", value: overview.total_accounts.toLocaleString() },
    { title: "Regions", value: overview.total_regions.toLocaleString() },
    { title: "Nodes", value: overview.total_nodes.toLocaleString() },
    { title: "Pods", value: overview.total_pods.toLocaleString() },
    {
      title: "Unhealthy",
      value: overview.unhealthy.toLocaleString(),
      description: `${overview.degraded} degraded`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <StatCard key={k.title} metric={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {overview.providers.map((p) => (
          <ProviderHeroCard
            key={p.provider}
            summary={p}
            onOpen={() => onOpenProvider(p.provider)}
          />
        ))}
      </div>
    </div>
  );
}

function ProviderHeroCard({
  summary,
  onOpen,
}: { summary: ProviderSummary; onOpen: () => void }): JSX.Element {
  const meta = providerMeta(summary.provider);
  return (
    <button type="button" onClick={onOpen} className="text-left">
      <PageSurface
        className="h-full transition-colors hover:border-[color:var(--color-primary-subtle-28)]"
        style={{ borderTop: `3px solid ${meta.accent}` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 place-items-center rounded-[10px]"
              style={{ background: meta.soft }}
            >
              <ProviderMark provider={summary.provider} size={26} />
            </span>
            <div>
              <div className="font-bold text-[17px] text-foreground tracking-tight">
                {meta.label}
              </div>
              <div className="font-mono text-[12px] text-foreground-muted">
                {summary.accounts} accounts · {summary.regions} regions
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-foreground-muted" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <HeroStat label="Resources" value={summary.resources.toLocaleString()} />
          <HeroStat label="Nodes" value={summary.nodes.toLocaleString()} />
          <HeroStat label="Pods" value={summary.pods.toLocaleString()} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {summary.categories.map((c) => (
            <span
              key={c.category}
              className="inline-flex items-center gap-1.5 rounded bg-secondary px-2 py-1 text-[12px] text-foreground-secondary"
            >
              {categoryLabel(c.category)}
              <span className="font-mono font-semibold text-foreground">{c.count}</span>
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <HealthPills health={summary.health} />
          {summary.restarts > 0 ? (
            <span className="font-mono text-[12px] text-warning">{summary.restarts} restarts</span>
          ) : null}
        </div>
      </PageSurface>
    </button>
  );
}

function HeroStat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <div className="font-medium text-[10px] text-foreground-muted uppercase tracking-[0.5px]">
        {label}
      </div>
      <div className="font-light text-[20px] text-foreground tabular-nums">{value}</div>
    </div>
  );
}
