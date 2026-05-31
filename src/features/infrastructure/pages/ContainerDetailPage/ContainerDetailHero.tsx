import { Link } from "@tanstack/react-router";
import { Grid3x3 } from "lucide-react";

import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import type { FleetPod } from "../../types";

interface ContainerDetailHeroProps {
  readonly container: string;
  readonly pod: FleetPod | null;
}

function Breadcrumb({ container }: { container: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.infrastructure} className="hover:text-foreground">
        Infrastructure
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground-secondary">Containers</span>
      <span aria-hidden="true">/</span>
      <span className="font-mono text-foreground">{container}</span>
    </div>
  );
}

function MetaLink({ label, to, value }: { label: string; to: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <Link to={dynamicTo(to)} className="font-medium font-mono text-primary hover:underline">
        {value}
      </Link>
    </span>
  );
}

function PodMeta({ pod }: { pod: FleetPod }) {
  const primaryService = pod.services[0] ?? null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-foreground-muted">
      <MetaLink
        label="host"
        to={ROUTES.hostDetail.replace("$host", encodeURIComponent(pod.host))}
        value={pod.host}
      />
      {primaryService && (
        <MetaLink
          label="service"
          to={ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(primaryService))}
          value={primaryService}
        />
      )}
      {pod.services.length > 1 && (
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
          <span>services</span>
          <strong className="font-medium text-foreground">{pod.services.length}</strong>
        </span>
      )}
    </div>
  );
}

export function ContainerDetailHero({ container, pod }: ContainerDetailHeroProps) {
  return (
    <header>
      <Breadcrumb container={container} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle-12)] text-primary">
          <Grid3x3 size={20} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="truncate font-mono font-semibold text-[22px] text-foreground leading-tight">
            {container}
          </h1>
          {pod && <PodMeta pod={pod} />}
        </div>
      </div>
    </header>
  );
}
