import { RefreshCw, Server } from "lucide-react";

import { useAppStore } from "@store/appStore";

import { fmtNum } from "../../ServiceDetailPage/formatters";
import type { CatalogAggregate } from "../hooks/useCatalogAggregate";

interface ServiceCatalogHeaderProps {
  readonly aggregate: CatalogAggregate;
}

function HeaderIcon() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-bg,rgba(59,130,246,0.12))] text-[var(--color-primary,#3b82f6)]">
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

export function ServiceCatalogHeader({ aggregate }: ServiceCatalogHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <HeaderIcon />
        <div>
          <h1 className="font-semibold text-[20px] text-[var(--text-primary)]">Services</h1>
          <div className="text-[12px] text-[var(--text-muted)]">
            {aggregate.totalServices} services · {fmtNum(aggregate.totalRps)} rps total
          </div>
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
