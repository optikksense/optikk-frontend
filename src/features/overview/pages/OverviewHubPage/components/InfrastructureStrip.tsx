import { useNavigate } from "@tanstack/react-router";
import { Database, Layers3 } from "lucide-react";
import type { ReactNode } from "react";

import { Surface } from "@/components/ui";
import { ROUTES } from "@/shared/constants/routes";

interface InfraTile {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly route: string;
  readonly icon: ReactNode;
}

const TILES: readonly InfraTile[] = [
  {
    key: "kafka",
    label: "Kafka",
    description: "Brokers · topics · consumer lag",
    route: ROUTES.saturationKafkaOverview,
    icon: <Layers3 size={14} />,
  },
  {
    key: "database",
    label: "Database",
    description: "Connections · queries · replica lag",
    route: ROUTES.saturationDatabase,
    icon: <Database size={14} />,
  },
];

export default function InfrastructureStrip() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="font-medium text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
          Infrastructure
        </span>
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.saturation })}
          className="text-[11px] text-[var(--color-primary)] hover:underline"
        >
          Saturation hub →
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {TILES.map((tile) => (
          <Surface
            key={tile.key}
            elevation={1}
            padding="md"
            className="cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            <button
              type="button"
              onClick={() => navigate({ to: tile.route })}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{
                  background: "var(--color-primary-subtle-10)",
                  color: "var(--color-primary)",
                }}
              >
                {tile.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold text-[13px] text-[var(--text-primary)]">
                  {tile.label}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">{tile.description}</span>
              </span>
            </button>
          </Surface>
        ))}
      </div>
    </div>
  );
}
