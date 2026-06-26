import { Tag } from "lucide-react";

import { PageSurface } from "@shared/components/ui";

import type { ErrorFacetGroup } from "../../api/errorGroupsApi";

interface Props {
  readonly groups: ErrorFacetGroup[];
}

/** Human labels for the facet dimension keys returned by the backend. */
const FACET_LABELS: Record<string, string> = {
  service_version: "service.version",
  environment: "env",
  pod: "kube_pod",
  http_route: "http.route",
};

function FacetRow({ name, pct, count }: { name: string; pct: number; count: number }) {
  return (
    <div className="py-1.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="truncate font-mono text-[13px] text-foreground-secondary">{name}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-[12px] text-foreground-muted">{pct.toFixed(0)}%</span>
          <span className="min-w-[34px] text-right font-mono text-[12.5px] text-foreground-muted tabular-nums">
            {count.toLocaleString()}
          </span>
        </span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-surface-inset">
        <div className="h-full rounded-full bg-[var(--err)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WhereItHappensCard({ groups }: Props): JSX.Element {
  return (
    <PageSurface padding="lg">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="font-semibold text-[13px] text-foreground">Where it happens</div>
        <Tag size={14} className="text-foreground-muted" />
      </div>

      {groups.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-foreground-muted">
          No tag breakdown available for this window.
        </div>
      ) : (
        groups.map((g, i) => (
          <div key={g.key} className={i > 0 ? "mt-3 border-border/60 border-t pt-3" : "pt-2"}>
            <div className="mb-1 text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
              {FACET_LABELS[g.key] ?? g.key}
            </div>
            {g.facets.map((f) => (
              <FacetRow key={f.name} name={f.name} pct={f.pct} count={f.count} />
            ))}
          </div>
        ))
      )}
    </PageSurface>
  );
}
