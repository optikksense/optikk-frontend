import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageShell } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getFleetPods } from "../../api/hostsApi";
import { InfraLogsLink } from "../../components/InfraLogsLink";
import type { FleetPod } from "../../types";
import { ContainerDetailHero } from "./ContainerDetailHero";
import { ContainerDetailKpiCards } from "./ContainerDetailKpiCards";
import { ContainerDetailSystemMetrics } from "./ContainerDetailSystemMetrics";

function useContainerPod(podName: string): FleetPod | null {
  const podsQ = useTimeRangeQuery<FleetPod[]>("container-detail.pods-list", (_team, s, e) =>
    getFleetPods(s, e)
  );
  return useMemo(
    () => podsQ.data?.find((pod) => pod.pod_name === podName) ?? null,
    [podsQ.data, podName]
  );
}

export default function ContainerDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const container = decodeURIComponent(
    typeof params.container === "string" ? params.container : ""
  );
  const pod = useContainerPod(container);
  const host = pod?.host ?? "";
  const serviceName = pod?.services[0] ?? "";

  return (
    <PageShell>
      <ContainerDetailHero container={container} pod={pod} />
      {host && serviceName ? (
        <>
          <ContainerDetailKpiCards
            container={container}
            host={host}
            serviceName={serviceName}
          />
          <ContainerDetailSystemMetrics
            container={container}
            host={host}
            serviceName={serviceName}
          />
        </>
      ) : (
        <div className="rounded-md border border-border bg-card p-4 text-[12px] text-foreground-muted">
          No pod metadata available for <span className="font-mono">{container}</span> in the
          current time range.
        </div>
      )}
      <InfraLogsLink scope="pod" value={container} />
    </PageShell>
  );
}
