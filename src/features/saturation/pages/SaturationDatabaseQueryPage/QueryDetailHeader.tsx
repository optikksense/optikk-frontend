import { Link } from "@tanstack/react-router";
import { Database } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { ROUTES } from "@/shared/constants/routes";

// Same static threshold the Database hub uses for its "degraded" label
// (P95_DEGRADED_MS in SaturationDatabasePage). Not a real SLO — the backend
// has no /v1/slo source — so the badge is labelled as a plain p99 heuristic.
const P99_HIGH_MS = 1000;

function verb(queryText: string): string {
  const first = queryText.trim().split(/\s+/, 1)[0] ?? "";
  return first.toUpperCase();
}

function Breadcrumb() {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.saturation} className="hover:text-foreground">
        Saturation
      </Link>
      <span aria-hidden="true">/</span>
      <Link to={ROUTES.saturationDatabase} className="hover:text-foreground">
        Database
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground-secondary">Query</span>
    </div>
  );
}

export function QueryDetailHeader({ row }: { row: SlowQueryPatternRow }) {
  const v = verb(row.query_text);
  const p99High = (row.p99_ms ?? 0) >= P99_HIGH_MS;
  return (
    <header>
      <Breadcrumb />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-bg)] text-primary">
          <Database size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {v && (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-[11px] text-foreground-secondary tracking-[0.04em]">
                {v}
              </span>
            )}
            {row.collection_name && <Pill variant="neutral">{row.collection_name}</Pill>}
            {p99High && (
              <Pill variant="warning" dot>
                p99 high
              </Pill>
            )}
          </div>
          <div className="whitespace-pre-wrap break-words font-mono text-[13px] text-foreground leading-relaxed">
            {row.query_text || "—"}
          </div>
        </div>
      </div>
    </header>
  );
}
