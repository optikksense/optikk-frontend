import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicTo } from "@shared/utils/navigation";

import { CatalogDrawerDeploys } from "./CatalogDrawerDeploys";
import { CatalogDrawerDeps } from "./CatalogDrawerDeps";
import { CatalogDrawerSignals } from "./CatalogDrawerSignals";
import { StatusDot } from "./StatusDot";
import type { CatalogRow } from "./buildCatalogRows";

interface CatalogDrawerProps {
  readonly row: CatalogRow;
  readonly onClose: () => void;
}

function DrawerHeader({ row, onClose }: { row: CatalogRow; onClose: () => void }) {
  const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(row.serviceName));
  return (
    <header className="flex items-start justify-between gap-2 border-[var(--border-color)] border-b px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <StatusDot status={row.status} />
          <Link
            to={dynamicTo(detail)}
            className="truncate font-mono text-[13px] text-[var(--text-primary)] hover:text-[var(--color-primary,#3b82f6)]"
          >
            {row.serviceName} <ExternalLink size={11} className="inline" />
          </Link>
        </div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          {row.version} · {row.environment}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="grid h-7 w-7 place-items-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <X size={14} />
      </button>
    </header>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-[var(--border-color)] border-b px-4 py-3 last:border-b-0">
      <div className="mb-2 text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
        {title}
      </div>
      {children}
    </section>
  );
}

function QuickLinks({ row }: { row: CatalogRow }) {
  const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(row.serviceName));
  const tracesHref = `${ROUTES.traces}?service=${encodeURIComponent(row.serviceName)}`;
  const logsHref = `${ROUTES.logs}?service=${encodeURIComponent(row.serviceName)}`;
  const cls =
    "rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-center text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated,rgba(255,255,255,0.04))]";
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link to={dynamicTo(detail)} className={cls}>
        Dashboard
      </Link>
      <a href={tracesHref} className={cls}>
        Traces
      </a>
      <a href={logsHref} className={cls}>
        Logs
      </a>
      <Link to={dynamicTo(detail)} className={cls}>
        Full detail
      </Link>
    </div>
  );
}

export function CatalogDrawer({ row, onClose }: CatalogDrawerProps) {
  return (
    <aside className="flex h-full min-h-[600px] w-full flex-col overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]">
      <DrawerHeader row={row} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        <DrawerSection title="Golden signals · last 60m">
          <CatalogDrawerSignals row={row} />
        </DrawerSection>
        <DrawerSection title="Dependencies">
          <CatalogDrawerDeps serviceName={row.serviceName} />
        </DrawerSection>
        <DrawerSection title="Recent deploys">
          <CatalogDrawerDeploys serviceName={row.serviceName} />
        </DrawerSection>
        <DrawerSection title="Quick links">
          <QuickLinks row={row} />
        </DrawerSection>
      </div>
    </aside>
  );
}
