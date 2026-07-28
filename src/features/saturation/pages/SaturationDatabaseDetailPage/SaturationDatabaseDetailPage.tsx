import { useParams } from "@tanstack/react-router";
import { useState } from "react";

import { PageTabs } from "@shared/components/primitives/ui/page-tabs";
import { PageShell } from "@shared/components/ui/layout/PageShell";

import { DatabaseDetailHeader } from "./header/DatabaseDetailHeader";
import { useDatabaseInstance } from "./hooks/useDatabaseInstance";
import { DatabaseCollectionsTab } from "./tabs/DatabaseCollectionsTab";
import { DatabaseOverviewTab } from "./tabs/DatabaseOverviewTab";
import { DatabaseQueriesTab } from "./tabs/DatabaseQueriesTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "queries", label: "Queries" },
  { key: "collections", label: "Collections" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SaturationDatabaseDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const system = typeof params.system === "string" ? decodeURIComponent(params.system) : "";
  const { row, isPending } = useDatabaseInstance(system);
  const [tab, setTab] = useState<TabKey>("overview");

  if (!row) {
    return (
      <PageShell>
        <div className="rounded-md border border-border bg-card p-4 text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : `No datastore instance named "${system}" in this time range.`}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <DatabaseDetailHeader row={row} />
        <PageTabs items={TABS} activeKey={tab} onChange={(key) => setTab(key as TabKey)} />
        {tab === "overview" && <DatabaseOverviewTab system={system} />}
        {tab === "queries" && <DatabaseQueriesTab system={system} />}
        {tab === "collections" && <DatabaseCollectionsTab system={system} />}
      </div>
    </PageShell>
  );
}
