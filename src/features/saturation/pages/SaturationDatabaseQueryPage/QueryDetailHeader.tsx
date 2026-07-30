import { Link } from "@tanstack/react-router";
import { Activity, Database, Download } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";

import { ROUTES } from "@/shared/constants/routes";

import type { QueryDetailView } from "./viewModel";

// Same static threshold the Database hub uses for its "degraded" label
// (P95_DEGRADED_MS in SaturationDatabasePage). Not a real SLO — the backend
// has no /v1/slo source — so the badge is labelled as a plain p99 heuristic.
const P99_HIGH_MS = 1000;

function Breadcrumb() {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <span className="text-foreground">Saturation</span>
      <span aria-hidden="true">/</span>
      <Link to={ROUTES.databaseQueries} className="hover:text-foreground">
        Database
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground-secondary">Query</span>
    </div>
  );
}

const ACTION_CLASS =
  "flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] text-foreground-secondary hover:text-foreground";

export function QueryDetailHeader({
  view,
  onExport,
}: {
  view: QueryDetailView;
  onExport?: () => void;
}) {
  const p99High = (view.p99Ms ?? 0) >= P99_HIGH_MS;
  const hasErrors = view.errorCount > 0;
  return (
    <header>
      <Breadcrumb />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-bg)] text-primary">
          <Database size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {view.operationName && (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-[11px] text-foreground-secondary tracking-[0.04em]">
                {view.operationName}
              </span>
            )}
            {view.collectionName && <Pill variant="neutral">{view.collectionName}</Pill>}
            {view.topService && (
              <Pill variant="primary" title="Top issuing service">
                {view.topService}
              </Pill>
            )}
            {hasErrors && (
              <Pill variant="error" dot>
                errors
              </Pill>
            )}
            {!hasErrors && p99High && (
              <Pill variant="warning" dot>
                p99 high
              </Pill>
            )}
          </div>
          <div className="whitespace-pre-wrap break-words font-mono text-[13px] text-foreground leading-relaxed">
            {view.queryText || "—"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={ROUTES.traces} className={ACTION_CLASS}>
            <Activity size={13} />
            Traces
          </Link>
          {onExport && (
            <button type="button" onClick={onExport} className={ACTION_CLASS}>
              <Download size={13} />
              Export
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
