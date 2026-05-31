import { useNavigate } from "@tanstack/react-router";
import { Bell, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader, PageShell } from "@shared/components/ui";

import type { ListMonitorsParams, MonitorStatus } from "../../api/monitorsApi";
import { useMonitorsActivity } from "../../hooks/useMonitorsActivity";
import { useMonitorsList } from "../../hooks/useMonitorsList";

import ActivityCard from "./ActivityCard";
import KpiStrip from "./KpiStrip";
import MonitorsTable from "./MonitorsTable";
import Tabs, { type MonitorTab } from "./Tabs";

function tabToParams(tab: MonitorTab): ListMonitorsParams {
  switch (tab) {
    case "triggered":
      return { status: "alert" as MonitorStatus };
    case "muted":
      return { muted: true };
    case "no_data":
      return { status: "no_data" as MonitorStatus };
    default:
      return {};
  }
}

export default function MonitorsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MonitorTab>("triggered");
  const [search, setSearch] = useState("");

  const params = useMemo<ListMonitorsParams>(
    () => ({ ...tabToParams(tab), q: search || undefined, limit: 100 }),
    [tab, search]
  );

  const listQ = useMonitorsList(params);
  const activityQ = useMonitorsActivity(8);

  const counts = listQ.data?.counts ?? {
    alert: 0,
    warn: 0,
    ok: 0,
    no_data: 0,
    muted: 0,
    total: 0,
  };
  const monitors = listQ.data?.items ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Monitors"
        subtitle={`${counts.total} monitors · ${counts.muted} muted · ${counts.no_data} no data · evaluated continuously`}
        icon={<Bell size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/monitors/notifications" })}
              className="rounded border border-border bg-card px-3 py-1.5 text-foreground text-sm hover:bg-secondary"
            >
              Manage notifications
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/monitors/new" })}
              className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 font-medium text-sm text-white hover:bg-primary"
            >
              <Plus size={14} />
              New monitor
            </button>
          </div>
        }
      />

      <KpiStrip counts={counts} />

      <Tabs tab={tab} setTab={setTab} counts={counts} />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5">
          <Search size={14} className="text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search monitors by name…"
            className="w-72 bg-transparent text-foreground text-sm placeholder-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div>
          {listQ.isPending && monitors.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center text-foreground-muted text-sm">
              Loading monitors…
            </div>
          ) : (
            <MonitorsTable monitors={monitors} />
          )}
        </div>
        <ActivityCard events={activityQ.data ?? []} loading={activityQ.isPending} />
      </div>
    </PageShell>
  );
}
