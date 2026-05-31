import { cn } from "@/lib/utils";

type Hops = 1 | 2;

interface ServiceMapToolbarProps {
  readonly focus: string;
  readonly services: ReadonlyArray<string>;
  readonly onFocusChange: (next: string) => void;
  readonly hops: Hops;
  readonly onHopsChange: (next: Hops) => void;
  readonly nodeCount: number;
  readonly edgeCount: number;
}

const LEGEND: ReadonlyArray<{ label: string; color: string }> = [
  { label: "healthy", color: "var(--color-success,#10b981)" },
  { label: "degraded", color: "var(--color-warning,#f59e0b)" },
  { label: "error", color: "var(--color-error,#ef4444)" },
];

function HopButton({
  value,
  active,
  onClick,
}: {
  value: Hops;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-[12px] transition-colors",
        active ? "bg-card-hover text-foreground" : "text-foreground-muted hover:text-foreground"
      )}
    >
      {value} hop{value > 1 ? "s" : ""}
    </button>
  );
}

export function ServiceMapToolbar({
  focus,
  services,
  onFocusChange,
  hops,
  onHopsChange,
  nodeCount,
  edgeCount,
}: ServiceMapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-border border-b px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="font-medium text-[13px] text-foreground">Service map</div>
        <div className="text-[11px] text-foreground-muted">
          {nodeCount} services · {edgeCount} connections · focused on dependencies
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          {LEGEND.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 text-[11px] text-foreground-muted"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-md border border-border">
          <HopButton value={1} active={hops === 1} onClick={() => onHopsChange(1)} />
          <HopButton value={2} active={hops === 2} onClick={() => onHopsChange(2)} />
        </div>
        <select
          value={focus}
          onChange={(e) => onFocusChange(e.target.value)}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[12px] text-foreground outline-none"
        >
          {services.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
