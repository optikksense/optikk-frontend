import { useParams } from "@tanstack/react-router";

import { PageShell } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getPodOverview } from "../../api/podDetailApi";
import { ContainerDetailHero } from "./ContainerDetailHero";
import { ContainerDetailKpiCards } from "./ContainerDetailKpiCards";
import { ContainerDetailLogs } from "./ContainerDetailLogs";
import { ContainerDetailSystemMetrics } from "./ContainerDetailSystemMetrics";

export default function ContainerDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const pod = decodeURIComponent(typeof params.container === "string" ? params.container : "");

  const overviewQ = useTimeRangeQuery(`container-detail.overview.${pod}`, (_t, s, e) =>
    getPodOverview(pod, s, e)
  );
  const overview = overviewQ.data ?? null;
  const availableMetrics = overview ? overview.available_metrics : null;

  return (
    <PageShell>
      <ContainerDetailHero pod={pod} overview={overview} />
      <ContainerDetailKpiCards overview={overview} />
      <ContainerDetailSystemMetrics pod={pod} availableMetrics={availableMetrics} />
      <ContainerDetailLogs pod={pod} />
    </PageShell>
  );
}
