import { HardDrive, Share2 } from "lucide-react";
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
import { ROUTES } from "@/shared/constants/routes";
import { useTimeRange } from "@app/store/appStore";

import { INFRA_TAB, type InfraTabId, URL_TAB } from "../constants";

const FleetTab = lazy(() => import("./tabs/FleetTab"));
const ResourcesTab = lazy(() => import("./tabs/ResourcesTab"));
const KubernetesTab = lazy(() => import("./tabs/KubernetesTab"));
const JvmTab = lazy(() => import("./tabs/JvmTab"));
const NodesTab = lazy(() => import("./tabs/NodesTab"));

const TAB_ITEMS: { id: InfraTabId; label: string }[] = [
  { id: INFRA_TAB.fleet, label: "Fleet" },
  { id: INFRA_TAB.resources, label: "Resources" },
  { id: INFRA_TAB.kubernetes, label: "Kubernetes" },
  { id: INFRA_TAB.jvm, label: "JVM" },
  { id: INFRA_TAB.nodes, label: "Nodes" },
];

function parseTab(raw: string | null): InfraTabId {
  const allowed = TAB_ITEMS.map((t) => t.id);
  if (raw && (allowed as string[]).includes(raw)) return raw as InfraTabId;
  return INFRA_TAB.fleet;
}

export default function InfrastructureHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRange = useTimeRange();

  const activeTab = useMemo(() => parseTab(searchParams.get(URL_TAB)), [searchParams]);

  const setTab = (id: InfraTabId) => {
    const next = new URLSearchParams(searchParams);
    if (id === INFRA_TAB.fleet) next.delete(URL_TAB);
    else next.set(URL_TAB, id);
    setSearchParams(next, { replace: true });
  };

  const onCopyInfraShare = async (): Promise<void> => {
    const href = window.location.href;
    const snapshot = buildShareableSnapshot(
      "infrastructure",
      ROUTES.infrastructure,
      window.location.search,
      timeRange
    );
    const r = await copyUrlOrSnapshotJson(href, snapshot);
    if (r.mode === "url") {
      toast.success("Share link copied");
    } else {
      toast.success("URL was too long — copied view JSON instead.");
    }
  };

  const onExportInfraJson = async (): Promise<void> => {
    const snapshot = buildShareableSnapshot(
      "infrastructure",
      ROUTES.infrastructure,
      window.location.search,
      timeRange
    );
    await navigator.clipboard.writeText(snapshotToJson(snapshot));
    toast.success("View JSON copied");
  };

  return (
    <PageShell>
      <PageHeader
        title="Infrastructure"
        subtitle="Fleet map with Fill / Size / Group / Filter, plus host, Kubernetes, JVM, and resource telemetry—all driven from live APIs."
        icon={<HardDrive size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Share2 size={14} />}
              onClick={onCopyInfraShare}
            >
              Copy link
            </Button>
            <Button variant="ghost" size="sm" onClick={onExportInfraJson}>
              Export JSON
            </Button>
            <CreateAlertButton condition="error_rate" label="Create alert from infra" />
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
        {activeTab === INFRA_TAB.fleet ? <FleetTab /> : null}
        {activeTab === INFRA_TAB.resources ? <ResourcesTab /> : null}
        {activeTab === INFRA_TAB.kubernetes ? <KubernetesTab /> : null}
        {activeTab === INFRA_TAB.jvm ? <JvmTab /> : null}
        {activeTab === INFRA_TAB.nodes ? <NodesTab /> : null}
      </Suspense>

      <DashboardEntityDrawer />
    </PageShell>
  );
}
