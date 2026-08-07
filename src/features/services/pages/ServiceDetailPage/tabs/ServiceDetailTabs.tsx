import { cn } from "@shared/lib/utils";

import { SERVICE_TAB_IDS, type ServiceTabId } from "./useActiveServiceTab";

interface ServiceDetailTabsProps {
  readonly active: ServiceTabId;
  readonly onChange: (next: ServiceTabId) => void;
}

const LABELS: Record<ServiceTabId, string> = {
  overview: "Overview",
  errors: "Errors",
  traces: "Traces",
  logs: "Logs",
  dependencies: "Dependencies",
};

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: ServiceTabId;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1 border-b-2 px-3 py-2 text-[13px] transition-colors",
        active
          ? "border-[var(--color-primary,#3b82f6)] text-foreground"
          : "border-transparent text-foreground-muted hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function ServiceDetailTabs({ active, onChange }: ServiceDetailTabsProps) {
  return (
    <nav className="flex border-border border-b">
      {SERVICE_TAB_IDS.map((id) => (
        <TabButton
          key={id}
          id={id}
          label={LABELS[id]}
          active={active === id}
          onClick={() => onChange(id)}
        />
      ))}
    </nav>
  );
}
