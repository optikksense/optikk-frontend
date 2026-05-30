import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { dynamicNavigateOptions } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { DeploysKpiStrip } from "../deploys/DeploysKpiStrip";
import { DeployTimelineChart } from "../deploys/DeployTimelineChart";
import { RecentDeploysTable } from "../deploys/RecentDeploysTable";
import { useDeploysData } from "../deploys/useDeploysData";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <header className="border-border border-b px-4 py-3">
        <div className="font-medium text-[13px] text-foreground">{title}</div>
        <div className="text-[11px] text-foreground-muted">{subtitle}</div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DeploysTab() {
  const data = useDeploysData();
  const navigate = useNavigate();

  const openService = (serviceName: string) => {
    const detail = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
    navigate(dynamicNavigateOptions(detail));
  };

  return (
    <div className="flex flex-col gap-4">
      <DeploysKpiStrip data={data} />
      <Card title="Deploy timeline" subtitle="Latest deploy per service, bucketed across the window">
        <DeployTimelineChart rows={data.rows} />
      </Card>
      <Card title="Recent deploys" subtitle="Latest version per service · click a row for detail">
        <RecentDeploysTable rows={data.rows} onRowClick={openService} />
      </Card>
    </div>
  );
}
