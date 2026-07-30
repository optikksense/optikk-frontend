import { useNavigate, useSearch } from "@tanstack/react-router";
import { Rocket, Search } from "lucide-react";
import { useMemo } from "react";

import { PageTabs } from "@shared/components/primitives/ui/page-tabs";
import { Select } from "@shared/components/primitives/ui/select";
import { KpiCard } from "@shared/components/ui/cards/StatCard";
import PageHeader from "@shared/components/ui/layout/PageHeader";
import { PageShell, PageSurface } from "@shared/components/ui/layout/PageShell";
import { cn } from "@shared/lib/utils";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";

import type { Deployment } from "../../api/deploymentsApi";
import { useDeploymentsList } from "../../hooks/useDeployments";
import { DeploymentTable } from "./DeploymentTable";
import { DeploymentTimeline } from "./DeploymentTimeline";

type DeploymentsTab = "list" | "timeline";
type DeploymentsSort = "newest" | "oldest" | "traffic" | "errors";

function normalizeTab(value: string | undefined): DeploymentsTab {
  return value === "timeline" ? "timeline" : "list";
}

function normalizeSort(value: string | undefined): DeploymentsSort {
  return value === "oldest" || value === "traffic" || value === "errors" ? value : "newest";
}

export default function DeploymentsPage() {
  const search = useSearch({ from: "/_app/deployments/" });
  const navigate = useNavigate();
  const query = useDeploymentsList();
  const tab = normalizeTab(search.tab);
  const sort = normalizeSort(search.sort);
  const environment = search.env;
  const needle = (search.q ?? "").trim().toLowerCase();

  const rows = useMemo(() => {
    const filtered = (query.data?.results ?? []).filter((row) => {
      if (environment !== undefined && row.environment !== environment) return false;
      if (!needle) return true;
      return `${row.service} ${row.version} ${row.environment}`.toLowerCase().includes(needle);
    });
    return filtered.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime();
        case "traffic":
          return b.trafficShare - a.trafficShare;
        case "errors":
          return b.errorRate - a.errorRate;
        default:
          return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
      }
    });
  }, [environment, needle, query.data?.results, sort]);

  const updateSearch = (next: {
    tab?: string;
    env?: string;
    q?: string;
    sort?: string;
  }) => {
    void navigate({
      to: "/deployments",
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
    });
  };

  const openDeployment = (deployment: Deployment) => {
    void navigate({
      to: "/deployments/$service/$version",
      params: { service: deployment.service, version: deployment.version },
      search: {
        from: search.from,
        to: search.to,
        tz: search.tz,
        env: deployment.environment,
      },
    });
  };

  const summary = query.data?.summary;
  return (
    <PageShell>
      <PageHeader
        title="Deployments"
        icon={<Rocket size={24} />}
        subtitle="Compare request volume, errors, and tail latency across reported service versions."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Deployments in range"
          value={query.isPending ? "—" : formatNumber(summary?.deploymentCount ?? 0)}
          subtext="First seen version identities"
        />
        <KpiCard
          label="Services deployed"
          value={query.isPending ? "—" : formatNumber(summary?.serviceCount ?? 0)}
          subtext="With service.version"
        />
        <KpiCard
          label="Environments"
          value={query.isPending ? "—" : formatNumber(summary?.environmentCount ?? 0)}
          subtext="Present in the selected range"
        />
        <KpiCard
          label="Latest deploy"
          value={
            query.isPending
              ? "—"
              : summary?.latestFirstSeen
                ? formatRelativeTime(summary.latestFirstSeen)
                : "None"
          }
          subtext="Latest first-seen timestamp"
        />
      </div>

      <PageSurface padding="md" className="flex flex-col gap-4">
        <PageTabs
          activeKey={tab}
          items={[
            { key: "list", label: "List", count: rows.length },
            { key: "timeline", label: "Rollout timeline", count: rows.length },
          ]}
          onChange={(key) => updateSearch({ tab: key === "list" ? undefined : key })}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-muted px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search size={14} className="shrink-0 text-foreground-muted" />
            <input
              type="search"
              aria-label="Search deployments"
              value={search.q ?? ""}
              onChange={(event) =>
                updateSearch({ q: event.target.value === "" ? undefined : event.target.value })
              }
              placeholder="Search service, version, or environment…"
              className="h-8 min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-foreground-muted"
            />
          </div>
          <Select
            size="sm"
            className="w-[150px]"
            value={sort}
            onChange={(value) =>
              updateSearch({ sort: value === "newest" ? undefined : String(value) })
            }
            options={[
              { label: "Newest first", value: "newest" },
              { label: "Oldest first", value: "oldest" },
              { label: "Highest traffic", value: "traffic" },
              { label: "Highest errors", value: "errors" },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-1.5" aria-label="Filter by environment">
          {[undefined, ...(query.data?.environments ?? [])].map((env) => (
            <button
              key={env === undefined ? "all" : env || "default"}
              type="button"
              onClick={() => updateSearch({ env })}
              className={cn(
                "h-7 rounded-full border px-3 text-[11.5px] transition-colors",
                environment === env
                  ? "border-primary/60 bg-primary/10 font-medium text-primary"
                  : "border-border bg-muted text-foreground-secondary hover:text-foreground"
              )}
            >
              {env === undefined ? "All environments" : env || "Default"}
            </button>
          ))}
        </div>

        {query.isError ? (
          <div className="rounded-md border border-error/30 bg-error-subtle px-4 py-5 text-center text-[12.5px] text-error">
            Deployments could not be loaded. {query.error?.message}
          </div>
        ) : tab === "timeline" ? (
          <DeploymentTimeline rows={rows} onOpen={openDeployment} />
        ) : (
          <DeploymentTable rows={rows} loading={query.isPending} onOpen={openDeployment} />
        )}
      </PageSurface>
    </PageShell>
  );
}
