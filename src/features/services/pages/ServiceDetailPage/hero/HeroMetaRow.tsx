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
  if (instanceCount != null) items.push({ label: "instances", value: String(instanceCount) });
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
