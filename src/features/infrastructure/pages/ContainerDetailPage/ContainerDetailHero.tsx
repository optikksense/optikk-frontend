import { Link } from "@tanstack/react-router";
import { Grid3x3 } from "lucide-react";

import { formatRelativeTime } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import type { PodOverview } from "../../api/podDetailApi";

interface ContainerDetailHeroProps {
  readonly pod: string;
  readonly overview: PodOverview | null;
}

function Breadcrumb({ pod }: { pod: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.infrastructure} className="hover:text-foreground">
        Infrastructure
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground-secondary">Containers</span>
      <span aria-hidden="true">/</span>
      <span className="font-mono text-foreground">{pod}</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <strong className="font-medium text-foreground">{value}</strong>
    </span>
  );
}

function MetaLink({ label, to, value }: { label: string; to: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <Link to={to as string & {}} className="font-medium font-mono text-primary hover:underline">
        {value}
      </Link>
    </span>
  );
}

function PodMeta({ overview }: { overview: PodOverview }) {
  const primaryService = overview.services[0];
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-foreground-muted">
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
      {overview.last_seen && (
        <MetaItem label="last seen" value={formatRelativeTime(overview.last_seen)} />
      )}
    </div>
  );
}

export function ContainerDetailHero({ pod, overview }: ContainerDetailHeroProps) {
  return (
    <header>
      <Breadcrumb pod={pod} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
          <Grid3x3 size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="truncate font-mono font-semibold text-[22px] text-foreground leading-tight">
            {pod}
          </h1>
          {overview && <PodMeta overview={overview} />}
        </div>
      </div>
    </header>
  );
}
