import { cn } from "@shared/lib/utils";

interface DrawerTab {
  readonly id: string;
  readonly label: string;
  readonly badge?: number | null;
}

interface DrawerTabsProps {
  readonly tabs: readonly DrawerTab[];
  readonly active: string;
  readonly onChange: (id: string) => void;
}

export function DrawerTabs({ tabs, active, onChange }: DrawerTabsProps) {
  return (
    <div
      role="tablist"
      className="flex shrink-0 items-center gap-1 border-[var(--line)] border-b px-[18px]"
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "-mb-px inline-flex cursor-pointer items-center gap-1.5 border-transparent border-b-2 bg-transparent px-3 py-2.5 text-[12.5px] text-[var(--fg-2)] hover:text-[var(--fg-0)]",
              isActive && "border-b-[var(--accent)] text-[var(--fg-0)]"
            )}
          >
            <span>{t.label}</span>
            {t.badge != null && (
              <span className="inline-flex h-4 items-center rounded-full bg-[var(--bg-inset)] px-1.5 font-mono text-[11px] text-[var(--fg-2)]">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
