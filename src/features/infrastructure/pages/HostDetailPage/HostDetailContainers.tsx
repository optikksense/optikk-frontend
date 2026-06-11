import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { dynamicTo } from "@shared/utils/navigation";

import { getFleetPods } from "../../api/hostsApi";
import InfraPodsTable, { getPodDetails } from "../../components/InfraPodsTable";
import type { FleetPod } from "../../types";

interface HostDetailContainersProps {
  readonly host: string;
}

export function HostDetailContainers({ host }: HostDetailContainersProps) {
  const navigate = useNavigate();
  const podsQ = useTimeRangeQuery<FleetPod[]>("host-detail.fleet-pods", (_team, s, e) =>
    getFleetPods(s, e)
  );
  const pods = useMemo(
    () => (podsQ.data ?? []).filter((pod) => pod.host === host),
    [podsQ.data, host]
  );

  const processedPods = useMemo(() => {
    return pods.map((p) => {
      const details = getPodDetails(p.pod_name, p.error_rate);
      return {
        ...p,
        ...details,
      };
    });
  }, [pods]);

  const onOpenHost = (h: string) => {
    navigate({ to: dynamicTo(ROUTES.hostDetail.replace("$host", encodeURIComponent(h))) });
  };

  const onOpenContainer = (container: string) => {
    navigate({
      to: dynamicTo(ROUTES.containerDetail.replace("$container", encodeURIComponent(container))),
    });
  };

  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 font-semibold text-[13px] text-foreground">Containers on this host</div>
      {pods.length === 0 ? (
        <div className="grid h-[120px] place-items-center text-[12px] text-foreground-muted">
          {podsQ.isPending
            ? "Loading containers…"
            : "No containers reported on this host in the current time range."}
        </div>
      ) : (
        <InfraPodsTable
          pods={processedPods}
          onOpenContainer={onOpenContainer}
          onOpenHost={onOpenHost}
        />
      )}
    </section>
  );
}
