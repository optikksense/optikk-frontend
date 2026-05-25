import { Activity, AlertTriangle, FileWarning, Percent } from "lucide-react";
import { memo, useMemo } from "react";

import type { LogsSummary } from "../../api/logsAnalyticsApi";

interface Props {
  readonly summary: LogsSummary | undefined;
  readonly loading?: boolean;
}

interface KpiCard {
  readonly label: string;
  readonly value: string;
  readonly icon: React.ReactNode;
  readonly tone: "default" | "error" | "warn" | "info";
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const toneColors: Record<string, { text: string; bg: string; border: string }> = {
  default: { text: "var(--text-primary)", bg: "var(--bg-card)", border: "var(--border-color)" },
  error: { text: "#e8494d", bg: "rgba(242,73,92,0.06)", border: "rgba(242,73,92,0.2)" },
  warn: { text: "#e0b400", bg: "rgba(242,204,12,0.05)", border: "rgba(242,204,12,0.18)" },
  info: {
    text: "var(--color-primary)",
    bg: "var(--color-primary-subtle-05)",
    border: "var(--color-primary-subtle-15)",
  },
};

function LogsKpiStripComponent({ summary, loading }: Props) {
  const cards = useMemo<KpiCard[]>(() => {
    if (!summary) return [];
    const errorRate = summary.total > 0 ? (summary.errors / summary.total) * 100 : 0;
    return [
      {
        label: "Total Logs",
        value: formatCompact(summary.total),
        icon: <Activity size={16} />,
        tone: "default",
      },
      {
        label: "Errors",
        value: formatCompact(summary.errors),
        icon: <AlertTriangle size={16} />,
        tone: summary.errors > 0 ? "error" : "default",
      },
      {
        label: "Warnings",
        value: formatCompact(summary.warns),
        icon: <FileWarning size={16} />,
        tone: summary.warns > 0 ? "warn" : "default",
      },
      {
        label: "Error Rate",
        value: `${errorRate.toFixed(2)}%`,
        icon: <Percent size={16} />,
        tone: errorRate > 5 ? "error" : errorRate > 1 ? "warn" : "default",
      },
    ];
  }, [summary]);

  if (loading && !summary) {
    return (
      <div className="flex gap-3 px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[68px] flex-1 animate-pulse rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)]"
          />
        ))}
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <div className="flex gap-3 px-4 py-3">
      {cards.map((card) => {
        const colors = toneColors[card.tone];
        return (
          <div
            key={card.label}
            className="flex flex-1 items-center gap-3 rounded-[var(--card-radius)] border px-4 py-3 transition-shadow hover:shadow-[var(--shadow-sm)]"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
            }}
          >
            <div className="rounded-md bg-[var(--bg-tertiary)] p-2" style={{ color: colors.text }}>
              {card.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {card.label}
              </span>
              <span
                className="font-semibold text-[22px] leading-7"
                style={{ color: colors.text, fontWeight: 300 }}
              >
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const LogsKpiStrip = memo(LogsKpiStripComponent);
