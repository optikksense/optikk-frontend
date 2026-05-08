import toast from "react-hot-toast";
import { useCallback } from "react";

import DashboardEntityDrawer from "@shared/components/ui/dashboard/DashboardEntityDrawer";
import { PageShell, PageSurface } from "@shared/components/ui";
import {
  buildShareableSnapshot,
  copyUrlOrSnapshotJson,
  snapshotToJson,
} from "@shared/observability/shareableView";

import { ROUTES } from "@/shared/constants/routes";
import { useTimeRange } from "@app/store/appStore";

import { HttpDetailSection } from "@/features/services/components/HttpDetailSection";

import LeftRail from "./LeftRail/LeftRail";
import ServiceKpiStrip from "./ServiceKpiStrip";
import ServicePageHeader from "./ServicePageHeader";
import { useServiceIdentity } from "./useServiceIdentity";
import { useServiceNavigation } from "./useServiceNavigation";
import { useServiceSummary } from "./useServiceSummary";
import ServicePageSections from "./sections/ServicePageSections";

function InvalidIdentity() {
  return (
    <PageShell>
      <PageSurface padding="lg">
        <div className="text-[13px] text-[var(--text-muted)]">
          This URL does not contain a service name.
        </div>
      </PageSurface>
    </PageShell>
  );
}

function buildSnapshot(serviceName: string, timeRange: ReturnType<typeof useTimeRange>) {
  return buildShareableSnapshot(
    "overview",
    ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName)),
    window.location.search,
    timeRange
  );
}

function useShareActions(serviceName: string) {
  const timeRange = useTimeRange();
  const onCopyShare = useCallback(async () => {
    const r = await copyUrlOrSnapshotJson(window.location.href, buildSnapshot(serviceName, timeRange));
    if (r.mode === "url") toast.success("Share link copied");
    else toast.success("URL was too long — copied view JSON instead.");
  }, [serviceName, timeRange]);

  const onExportJson = useCallback(async () => {
    await navigator.clipboard.writeText(snapshotToJson(buildSnapshot(serviceName, timeRange)));
    toast.success("View JSON copied");
  }, [serviceName, timeRange]);

  return { onCopyShare, onExportJson };
}

interface ServicePageBodyProps {
  readonly serviceName: string;
}

function ServicePageBody({ serviceName }: ServicePageBodyProps) {
  const { summary, summaryLoading, activeVersion } = useServiceSummary(serviceName);
  const { onCopyShare, onExportJson } = useShareActions(serviceName);
  const { openTraces, openLogs } = useServiceNavigation(serviceName);

  return (
    <div className="flex gap-4">
      <LeftRail
        serviceName={serviceName}
        activeVersion={activeVersion?.version || null}
        environment={activeVersion?.environment || null}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <ServicePageHeader
          serviceName={serviceName}
          activeVersion={activeVersion}
          summary={summary}
          onCopyShare={onCopyShare}
          onExportJson={onExportJson}
          onOpenTraces={openTraces}
          onOpenLogs={openLogs}
        />
        <ServiceKpiStrip summary={summary} loading={summaryLoading} />
        <ServicePageSections serviceName={serviceName} />
        <HttpDetailSection serviceName={serviceName} />
      </div>
    </div>
  );
}

export default function ServicePage() {
  const identity = useServiceIdentity();
  if (!identity.isValid) return <InvalidIdentity />;
  return (
    <PageShell>
      <ServicePageBody serviceName={identity.serviceName} />
      <DashboardEntityDrawer />
    </PageShell>
  );
}
