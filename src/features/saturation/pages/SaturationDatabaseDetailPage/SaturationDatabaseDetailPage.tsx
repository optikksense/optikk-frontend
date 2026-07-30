import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

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
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { tab?: unknown };
  const system = typeof params.system === "string" ? decodeURIComponent(params.system) : "";
  const { row, isPending } = useDatabaseInstance(system);
  const tab: TabKey =
    search.tab === "queries" || search.tab === "collections" ? search.tab : "overview";

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
        <PageTabs
          items={TABS}
          activeKey={tab}
          onChange={(key) =>
            navigate({
              search: ((previous: Record<string, unknown>) => ({
                ...previous,
                tab: key === "overview" ? undefined : key,
              })) as never,
              replace: true,
            })
          }
        />
        {tab === "overview" && <DatabaseOverviewTab system={system} />}
        {tab === "queries" && <DatabaseQueriesTab system={system} />}
        {tab === "collections" && <DatabaseCollectionsTab system={system} />}
      </div>
    </PageShell>
  );
}
