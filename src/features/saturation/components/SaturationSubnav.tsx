import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@shared/lib/utils";

type SaturationHubTab = "overview" | "kafka" | "database";

interface SaturationSubnavProps {
  readonly active: SaturationHubTab;
  readonly counts?: Partial<Record<SaturationHubTab, number>>;
}

interface Item {
  readonly id: SaturationHubTab;
  readonly label: string;
  readonly href: string;
}

const ITEMS: ReadonlyArray<Item> = [
  { id: "overview", label: "Overview", href: ROUTES.saturation },
  { id: "kafka", label: "Kafka", href: ROUTES.saturationKafkaOverview },
  { id: "database", label: "Database", href: ROUTES.saturationDatabase },
];

function Count({ value }: { value: number }) {
  return (
    <span className="ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[var(--bg-2)] px-1 text-[10px] text-foreground-muted">
      {value}
    </span>
  );
}

export function SaturationSubnav({ active, counts }: SaturationSubnavProps) {
  return (
    <nav className="flex border-border border-b" aria-label="Saturation sections">
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        const count = counts?.[item.id];
        return (
          <Link
            key={item.id}
            to={item.href as string & {}}
            className={cn(
              "flex items-center gap-1 border-b-2 px-3 py-2 text-[13px] transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            {item.label}
            {count != null && count > 0 && <Count value={count} />}
          </Link>
        );
      })}
    </nav>
  );
}
