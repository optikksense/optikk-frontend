import { relativeTimeFromIso } from "../formatters";
import type { HeroData } from "../hooks/useServiceHeroData";

interface HeroMetaRowProps {
  readonly hero: HeroData;
  readonly instanceCount: number | null;
}

interface MetaItem {
  readonly label: string;
  readonly value: string;
}

function buildItems(hero: HeroMetaRowProps["hero"], instanceCount: number | null): MetaItem[] {
  const items: MetaItem[] = [];
  if (hero.deployment?.version) items.push({ label: "version", value: hero.deployment.version });
  if (hero.deployment?.environment)
    items.push({ label: "env", value: hero.deployment.environment });
  if (instanceCount != null) items.push({ label: "instances", value: String(instanceCount) });
  if (hero.deployment?.deployedAtIso)
    items.push({ label: "last deploy", value: relativeTimeFromIso(hero.deployment.deployedAtIso) });
  return items;
}

export function HeroMetaRow({ hero, instanceCount }: HeroMetaRowProps) {
  const items = buildItems(hero, instanceCount);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-foreground-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-baseline gap-1 whitespace-nowrap">
          <span>{item.label}</span>
          <strong className="font-medium text-foreground">{item.value}</strong>
        </span>
      ))}
    </div>
  );
}
