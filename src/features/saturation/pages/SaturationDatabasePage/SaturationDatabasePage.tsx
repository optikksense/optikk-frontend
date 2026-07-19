import { Database } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@shared/components/ui";
import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";
import { SaturationSubnav } from "@/features/saturation/components/SaturationSubnav";
import { fmtNum } from "@shared/utils/metricFormatters";

import { instanceStatus } from "./databaseInstanceModel";
import { useDatabaseSummary } from "./hooks/useDatabaseSummary";
import { useDatabaseSystemSparklines } from "./hooks/useDatabaseSystemSparklines";
import { useDatastoreSystems } from "./hooks/useDatastoreSystems";
import { DatabaseFilterBar } from "./list/DatabaseFilterBar";
import { DatabaseInstancesTable } from "./list/DatabaseInstancesTable";

function matchesFilters(row: DatastoreSystemRow, search: string, engine: string): boolean {
  if (engine !== "all" && row.system !== engine) return false;
  if (search && !row.system.toLowerCase().includes(search.toLowerCase())) return false;
  return true;
}

export default function SaturationDatabasePage() {
  const summaryQ = useDatabaseSummary();
  const systemsQ = useDatastoreSystems();
  const sparklines = useDatabaseSystemSparklines();

  const [search, setSearch] = useState("");
  const [engine, setEngine] = useState("all");

  const systems = useMemo(() => systemsQ.data ?? [], [systemsQ.data]);
  const engines = useMemo(
    () => Array.from(new Set(systems.map((s) => s.system))).sort(),
    [systems]
  );
  const filtered = useMemo(
    () => systems.filter((row) => matchesFilters(row, search, engine)),
    [systems, search, engine]
  );

  const healthy = systems.filter((s) => instanceStatus(s) === "ok").length;
  const attention = systems.length - healthy;
  const loading = systemsQ.isPending && systemsQ.data === undefined;

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <header className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-bg)] text-primary">
            <Database size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-[20px] text-foreground">Database Monitoring</h1>
            <div className="text-[12px] text-foreground-muted">
              {systems.length} instances · {engines.join(" · ") || "no engines reporting"}
            </div>
          </div>
        </header>

        <SaturationSubnav active="database" counts={{ database: summaryQ.data?.databaseSystems }} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Instances" value={fmtNum(systems.length)} subtext="monitored" />
          <KpiCard
            label="Queries"
            value={summaryQ.data ? fmtNum(summaryQ.data.queryCount) : "—"}
            subtext="in window"
          />
          <KpiCard label="Healthy" value={fmtNum(healthy)} tone="ok" subtext="instances" />
          <KpiCard
            label="Need attention"
            value={fmtNum(attention)}
            tone={attention > 0 ? "warn" : "ok"}
            subtext="degraded or critical"
          />
        </div>

        <DatabaseFilterBar
          search={search}
          onSearch={setSearch}
          engine={engine}
          onEngine={setEngine}
          engines={engines}
          shownCount={filtered.length}
          totalCount={systems.length}
        />

        <DatabaseInstancesTable rows={filtered} loading={loading} sparklines={sparklines} />
      </div>
    </PageShell>
  );
}
