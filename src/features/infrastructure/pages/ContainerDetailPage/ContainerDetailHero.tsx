import { Grid3x3 } from "lucide-react";

import { formatRelativeTime } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import {
  DetailBreadcrumb,
  DetailHeroLayout,
  DetailMetaRow,
  MetaItem,
  MetaLink,
} from "../../components/detail/DetailHero";

import type { PodOverview } from "../../api/podDetailApi";

interface ContainerDetailHeroProps {
  readonly pod: string;
  readonly overview: PodOverview | null;
}

function PodMeta({ overview }: { overview: PodOverview }) {
  const primaryService = overview.services[0];
  return (
    <DetailMetaRow>
      {overview.host && (
        <MetaLink
          label="host"
          to={ROUTES.hostDetail.replace("$host", encodeURIComponent(overview.host))}
          value={overview.host}
        />
      )}
      {primaryService && (
        <MetaLink
          label="service"
          to={ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(primaryService))}
          value={primaryService}
        />
      )}
      {overview.services.length > 1 && (
        <MetaItem label="services" value={String(overview.services.length)} />
      )}
      {overview.containers.length > 0 && (
        <MetaItem label="containers" value={overview.containers.join(", ")} />
      )}
      {overview.namespaces.length > 0 && (
        <MetaItem label="namespace" value={overview.namespaces.join(", ")} />
      )}
      {overview.environments.length > 0 && (
        <MetaItem label="env" value={overview.environments.join(", ")} />
      )}
      {overview.lastSeen && (
        <MetaItem label="last seen" value={formatRelativeTime(overview.lastSeen)} />
      )}
    </DetailMetaRow>
  );
}

export function ContainerDetailHero({ pod, overview }: ContainerDetailHeroProps) {
  return (
    <header>
      <DetailBreadcrumb
        segments={[
          { label: "Containers", muted: true },
          { label: pod, mono: true },
        ]}
      />
      <DetailHeroLayout icon={<Grid3x3 size={20} />} title={pod}>
        {overview && <PodMeta overview={overview} />}
      </DetailHeroLayout>
    </header>
  );
}
