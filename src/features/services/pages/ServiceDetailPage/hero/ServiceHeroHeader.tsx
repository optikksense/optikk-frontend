import { Link } from "@tanstack/react-router";

import { ServiceAvatar } from "@/features/services/components/ServiceAvatar";
import { ROUTES } from "@/shared/constants/routes";

import type { HeroData } from "../hooks/useServiceHeroData";
import { HeroMetaRow } from "./HeroMetaRow";
import { StatusPill } from "./StatusPill";

interface ServiceHeroHeaderProps {
  readonly serviceName: string;
  readonly hero: HeroData;
  readonly instanceCount: number | null;
}

function Breadcrumb({ serviceName }: { serviceName: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[12px] text-foreground-muted">
      <Link to={ROUTES.services} className="hover:text-foreground">
        Services
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground">{serviceName}</span>
    </div>
  );
}

export function ServiceHeroHeader({ serviceName, hero, instanceCount }: ServiceHeroHeaderProps) {
  return (
    <header>
      <Breadcrumb serviceName={serviceName} />
      <div className="flex flex-wrap items-start gap-3">
        <ServiceAvatar serviceName={serviceName} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-semibold text-[24px] text-foreground leading-tight">
              {serviceName}
            </h1>
            <StatusPill status={hero.status} />
          </div>
          <HeroMetaRow hero={hero} instanceCount={instanceCount} />
        </div>
      </div>
    </header>
  );
}
