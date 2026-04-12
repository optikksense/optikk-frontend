import { LayoutDashboard, Share2 } from "lucide-react";
import { Suspense, lazy, useMemo } from "react";
import toast from "react-hot-toast";

import { Button } from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import {
  buildShareableSnapshot,
  copyUrlOrSnapshotJson,
  snapshotToJson,
} from "@shared/observability/shareableView";

import { CreateAlertButton } from "@/features/alerts/components/CreateAlertButton";
import {
  OVERVIEW_HUB_TAB,
  OVERVIEW_URL_TAB,
  type OverviewHubTabId,
} from "@/features/overview/overviewHubConstants";
import { ROUTES } from "@/shared/constants/routes";
import { useTimeRange } from "@app/store/appStore";

const SummaryTab = lazy(() => import("./tabs/SummaryTab"));
const LatencyRedTab = lazy(() => import("./tabs/LatencyRedTab"));
const ApmTab = lazy(() => import("./tabs/ApmTab"));
const ErrorsTab = lazy(() => import("./tabs/ErrorsTab"));
const HttpTab = lazy(() => import("./tabs/HttpTab"));
const SloTab = lazy(() => import("./tabs/SloTab"));

const TAB_ITEMS: { id: OverviewHubTabId; label: string }[] = [
  { id: OVERVIEW_HUB_TAB.summary, label: "Summary" },
  { id: OVERVIEW_HUB_TAB.latencyAnalysis, label: "Latency (RED)" },
  { id: OVERVIEW_HUB_TAB.apm, label: "APM" },
  { id: OVERVIEW_HUB_TAB.errors, label: "Errors" },
  { id: OVERVIEW_HUB_TAB.http, label: "HTTP" },
  { id: OVERVIEW_HUB_TAB.slo, label: "SLO" },
];

function parseTab(raw: string | null): OverviewHubTabId {
  const allowed = TAB_ITEMS.map((t) => t.id);
  if (raw && (allowed as string[]).includes(raw)) return raw as OverviewHubTabId;
  return OVERVIEW_HUB_TAB.summary;
}

function alertEntryForTab(tab: OverviewHubTabId): {
  presetKind: "service_error_rate" | "slo_burn_rate";
} | null {
  if (tab === OVERVIEW_HUB_TAB.errors || tab === OVERVIEW_HUB_TAB.apm) {
    return { presetKind: "service_error_rate" };
  }
  if (tab === OVERVIEW_HUB_TAB.slo) {
    return { presetKind: "slo_burn_rate" };
  }
  return null;
}

export default function OverviewHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRange = useTimeRange();

  const activeTab = useMemo(() => parseTab(searchParams.get(OVERVIEW_URL_TAB)), [searchParams]);

  const setTab = (id: OverviewHubTabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === OVERVIEW_HUB_TAB.summary) next.delete(OVERVIEW_URL_TAB);
    else next.set(OVERVIEW_URL_TAB, id);
    setSearchParams(next, { replace: true });
  };

  const onCopyShare = async (): Promise<void> => {
    const href = window.location.href;
    const snapshot = buildShareableSnapshot(
      "overview",
      ROUTES.overview,
      window.location.search,
      timeRange
    );
    const r = await copyUrlOrSnapshotJson(href, snapshot);
    if (r.mode === "url") toast.success("Share link copied");
    else toast.success("URL was too long — copied view JSON instead.");
  };

  const onExportJson = async (): Promise<void> => {
    const snapshot = buildShareableSnapshot(
      "overview",
      ROUTES.overview,
      window.location.search,
      timeRange
    );
    await navigator.clipboard.writeText(snapshotToJson(snapshot));
    toast.success("View JSON copied");
  };

  const alertEntry = alertEntryForTab(activeTab);

  return (
    <PageShell>
      <PageHeader
        title="Overview"
        subtitle="Golden signals, span-level RED analysis, HTTP semantics, errors, and SLO-style burn—built as a first-class hub."
        icon={<LayoutDashboard size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Share2 size={14} />} onClick={onCopyShare}>
              Copy link
            </Button>
            <Button variant="ghost" size="sm" onClick={onExportJson}>
              Export JSON
            </Button>
            {alertEntry ? (
              <CreateAlertButton
                prefill={{ presetKind: alertEntry.presetKind }}
                label="Create alert from this view"
              />
            ) : null}
          </div>
        }
      />

      <PageSurface
        padding="sm"
        className="bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]"
      >
        <div className="inline-flex flex-wrap gap-1 rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
          {TAB_ITEMS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={`rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </PageSurface>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-[13px] text-[var(--text-muted)]">
            Loading…
          </div>
        }
      >
        {activeTab === OVERVIEW_HUB_TAB.summary ? <SummaryTab /> : null}
        {activeTab === OVERVIEW_HUB_TAB.latencyAnalysis ? <LatencyRedTab /> : null}
        {activeTab === OVERVIEW_HUB_TAB.apm ? <ApmTab /> : null}
        {activeTab === OVERVIEW_HUB_TAB.errors ? <ErrorsTab /> : null}
        {activeTab === OVERVIEW_HUB_TAB.http ? <HttpTab /> : null}
        {activeTab === OVERVIEW_HUB_TAB.slo ? <SloTab /> : null}
      </Suspense>

      <DashboardEntityDrawer />
    </PageShell>
  );
}
