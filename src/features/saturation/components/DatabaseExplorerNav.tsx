import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@shared/lib/utils";

interface DatabaseExplorerNavProps {
  readonly active: "systems" | "queries";
}

const ITEMS = [
  { key: "systems", label: "Systems", to: ROUTES.database },
  { key: "queries", label: "Queries", to: ROUTES.databaseQueries },
] as const;

export function DatabaseExplorerNav({ active }: DatabaseExplorerNavProps) {
  return (
    <nav className="flex items-center rounded-md border border-border bg-card p-0.5">
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={cn(
            "rounded px-2.5 py-1 text-[12px]",
            active === item.key
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
