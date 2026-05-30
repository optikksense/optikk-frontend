import { cn } from "@/lib/utils";

import { SERVICE_TAB_IDS, type ServiceTabId } from "./useActiveServiceTab";

interface ServiceDetailTabsProps {
  readonly active: ServiceTabId;
  readonly counts: Partial<Record<ServiceTabId, number>>;
  readonly errorTabs?: ReadonlyArray<ServiceTabId>;
  readonly onChange: (next: ServiceTabId) => void;
}

const LABELS: Record<ServiceTabId, string> = {
  overview: "Overview",
  endpoints: "Endpoints",
  traces: "Traces",
  errors: "Errors",
  infra: "Infrastructure",
  deploys: "Deploys",
  logs: "Logs",
  code: "Code",
};

function TabCount({ value, isError }: { value: number; isError: boolean }) {
  return (
    <span
      className={cn(
        "ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px]",
        isError
          ? "bg-[var(--color-error-bg,rgba(239,68,68,0.16))] text-[var(--color-error,#ef4444)]"
          : "bg-[var(--bg-elevated,rgba(255,255,255,0.06))] text-foreground-muted"
      )}
    >
      {value}
    </span>
  );
}

function TabButton({
  id,
  label,
  active,
  count,
  isError,
  onClick,
}: {
  id: ServiceTabId;
  label: string;
  active: boolean;
  count: number | undefined;
  isError: boolean;
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
      {count != null && <TabCount value={count} isError={isError} />}
    </button>
  );
}

export function ServiceDetailTabs({
  active,
  counts,
  errorTabs = ["errors"],
  onChange,
}: ServiceDetailTabsProps) {
  return (
    <nav className="flex border-border border-b">
      {SERVICE_TAB_IDS.map((id) => (
        <TabButton
          key={id}
          id={id}
          label={LABELS[id]}
          active={active === id}
          count={counts[id]}
          isError={errorTabs.includes(id) && (counts[id] ?? 0) > 0}
          onClick={() => onChange(id)}
        />
      ))}
    </nav>
  );
}
