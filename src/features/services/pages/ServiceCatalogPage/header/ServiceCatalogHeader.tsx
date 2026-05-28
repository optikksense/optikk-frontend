import { RefreshCw, Server } from "lucide-react";

import { useAppStore } from "@store/appStore";

import { fmtNum } from "../../ServiceDetailPage/formatters";
import type { CatalogAggregate } from "../hooks/useCatalogAggregate";

interface ServiceCatalogHeaderProps {
  readonly aggregate: CatalogAggregate;
  readonly environment?: string | null;
}

function HeaderIcon() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)]">
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
      className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    >
      <RefreshCw size={14} />
    </button>
  );
}

function buildSubtitle(aggregate: CatalogAggregate, environment?: string | null): string {
  const parts: string[] = [];
  if (environment) parts.push(environment);
  parts.push(`${aggregate.totalServices} services`);
  parts.push(`${fmtNum(aggregate.totalRps)} rps total`);
  return parts.join(" · ");
}

export function ServiceCatalogHeader({ aggregate, environment }: ServiceCatalogHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <HeaderIcon />
        <div>
          <h1 className="font-bold text-[22px] text-[var(--text-primary)] leading-tight">
            Services
          </h1>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            {buildSubtitle(aggregate, environment)}
          </div>
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
