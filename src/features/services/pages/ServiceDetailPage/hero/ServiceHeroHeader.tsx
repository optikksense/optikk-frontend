import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import { relativeTimeFromIso } from "../formatters";
import type { HeroData } from "../hooks/useServiceHeroData";
import { StatusPill } from "./StatusPill";

interface ServiceHeroHeaderProps {
  readonly serviceName: string;
  readonly hero: HeroData;
  readonly instanceCount: number | null;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span>{label}</span>
      <strong className="font-medium text-[var(--text-primary)]">{value}</strong>
    </span>
  );
}

function HeroMeta({ hero, instanceCount }: { hero: HeroData; instanceCount: number | null }) {
  const env = hero.deployment?.environment ?? "—";
  const version = hero.deployment?.version ?? "—";
  const lastDeploy = relativeTimeFromIso(hero.deployment?.deployedAtIso);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[var(--text-muted)]">
      <MetaItem label="version" value={version} />
      <MetaItem label="env" value={env} />
      <MetaItem label="instances" value={instanceCount != null ? String(instanceCount) : "—"} />
      <MetaItem label="last deploy" value={lastDeploy} />
    </div>
  );
}

function Breadcrumb({ serviceName }: { serviceName: string }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
      <Link to={ROUTES.services} className="hover:text-[var(--text-primary)]">
        Services
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-[var(--text-primary)]">{serviceName}</span>
    </div>
  );
}

export function ServiceHeroHeader({ serviceName, hero, instanceCount }: ServiceHeroHeaderProps) {
  return (
    <header>
      <Breadcrumb serviceName={serviceName} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-mono font-semibold text-[20px] text-[var(--text-primary)]">
              {serviceName}
            </h1>
            <StatusPill status={hero.status} />
          </div>
          <HeroMeta hero={hero} instanceCount={instanceCount} />
        </div>
      </div>
    </header>
  );
}
