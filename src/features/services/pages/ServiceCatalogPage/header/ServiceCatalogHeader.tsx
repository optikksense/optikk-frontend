import { RefreshCw, Server } from "lucide-react";

import { useAppStore } from "@store/appStore";
import { useAuthTeam } from "@store/authStore";

import { fmtNum } from "../../ServiceDetailPage/formatters";
import type { CatalogAggregate } from "../hooks/useCatalogAggregate";

interface ServiceCatalogHeaderProps {
  readonly aggregate: CatalogAggregate;
  readonly environment?: string | null;
}

function HeaderIcon() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
      <Server size={18} />
    </div>
  );
}

function RefreshButton() {
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  return (
    <button
      type="button"
      title="Refresh"
      onClick={triggerRefresh}
      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground-muted hover:text-foreground"
    >
      <RefreshCw size={14} />
    </button>
  );
}

function buildSubtitle(
  aggregate: CatalogAggregate,
  environment?: string | null,
  org?: string | null
): string {
  const parts: string[] = [];
  if (org) parts.push(org);
  if (environment) parts.push(environment);
  parts.push(`${aggregate.totalServices} services`);
  parts.push(`${fmtNum(aggregate.totalRps)} rps total`);
  return parts.join(" · ");
}

export function ServiceCatalogHeader({ aggregate, environment }: ServiceCatalogHeaderProps) {
  const org = useAuthTeam()?.orgName ?? null;
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <HeaderIcon />
        <div>
          <h1 className="font-bold text-[22px] text-foreground leading-tight">Services</h1>
          <div className="mt-1 text-[12px] text-foreground-muted">
            {buildSubtitle(aggregate, environment, org)}
          </div>
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
