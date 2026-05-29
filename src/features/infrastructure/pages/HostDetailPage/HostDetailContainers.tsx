import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, podEqualsFilter } from "@shared/observability/deepLinks";

import { getFleetPods } from "../../api/hostsApi";
import InfraPodsTable from "../../components/InfraPodsTable";
import type { FleetPod } from "../../types";

interface HostDetailContainersProps {
  readonly host: string;
}

export function HostDetailContainers({ host }: HostDetailContainersProps) {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();
  const podsQ = useTimeRangeQuery<FleetPod[]>("host-detail.fleet-pods", (_team, s, e) =>
    getFleetPods(s, e)
  );
  const pods = useMemo(
    () => (podsQ.data ?? []).filter((pod) => pod.host === host),
    [podsQ.data, host]
  );

  const onOpenPodLogs = (podName: string): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [podEqualsFilter(podName)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  return (
    <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="mb-3 font-semibold text-[13px] text-[var(--text-primary)]">
        Containers on this host
      </div>
      {pods.length === 0 ? (
        <div className="grid h-[120px] place-items-center text-[12px] text-[var(--text-muted)]">
          {podsQ.isPending
            ? "Loading containers…"
            : "No containers reported on this host in the current time range."}
        </div>
      ) : (
        <InfraPodsTable pods={pods} onOpenPodLogs={onOpenPodLogs} />
      )}
    </section>
  );
}
