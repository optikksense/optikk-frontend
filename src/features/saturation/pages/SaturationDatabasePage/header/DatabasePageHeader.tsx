import { Database, RefreshCw } from "lucide-react";

import { Pill } from "@shared/components/primitives/ui/pill";
import { useAppStore } from "@store/appStore";

import type { DatastoreSummary } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

interface DatabasePageHeaderProps {
  readonly summary: DatastoreSummary | undefined;
  readonly degraded?: { readonly label: string } | null;
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

function Subtitle({ summary }: { summary: DatastoreSummary | undefined }) {
  if (!summary) {
    return <div className="text-[12px] text-foreground-muted">Loading…</div>;
  }
  return (
    <div className="text-[12px] text-foreground-muted">
      {fmtNum(summary.database_systems)} database systems · {fmtNum(summary.query_count)} queries in
      window
    </div>
  );
}

export function DatabasePageHeader({ summary, degraded }: DatabasePageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-bg)] text-primary">
          <Database size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-[20px] text-foreground">Database</h1>
            {degraded && (
              <Pill variant="warning" dot>
                {degraded.label}
              </Pill>
            )}
          </div>
          <Subtitle summary={summary} />
        </div>
      </div>
      <RefreshButton />
    </header>
  );
}
