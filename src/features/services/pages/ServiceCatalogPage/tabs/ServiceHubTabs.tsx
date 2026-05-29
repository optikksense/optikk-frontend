import { cn } from "@/lib/utils";

import { SERVICE_HUB_TABS, type ServiceHubTab } from "../useServiceHubTab";

interface ServiceHubTabsProps {
  readonly active: ServiceHubTab;
  readonly counts: Partial<Record<ServiceHubTab, number>>;
  readonly onChange: (next: ServiceHubTab) => void;
}

const LABELS: Record<ServiceHubTab, string> = {
  catalog: "Catalog",
  map: "Service map",
  deploys: "Deploys",
};

function TabCount({ value, isError }: { value: number; isError: boolean }) {
  return (
    <span
      className={cn(
        "ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px]",
        isError
          ? "bg-[var(--color-error-subtle)] text-[var(--color-error)]"
          : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
      )}
    >
      {value}
    </span>
  );
}

function TabButton({
  id,
  active,
  count,
  onClick,
}: {
  id: ServiceHubTab;
  active: boolean;
  count: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 border-b-2 px-3 py-2 text-[13px] transition-colors",
        active
          ? "border-[var(--color-primary)] text-[var(--text-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      )}
    >
      {LABELS[id]}
      {count != null && <TabCount value={count} isError={false} />}
    </button>
  );
}

export function ServiceHubTabs({ active, counts, onChange }: ServiceHubTabsProps) {
  return (
    <nav className="flex border-[var(--border-color)] border-b">
      {SERVICE_HUB_TABS.map((id) => (
        <TabButton
          key={id}
          id={id}
          active={active === id}
          count={counts[id]}
          onClick={() => onChange(id)}
        />
      ))}
    </nav>
  );
}
