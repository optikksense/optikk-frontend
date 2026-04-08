/**
 * Fix 18: PodLifecycleGantt
 * Renders a Gantt-style timeline of pod lifecycle events:
 * pending → running → terminated, with restart markers.
 */
import { Surface, Tooltip } from "@/components/ui";
import type React from "react";
import { useMemo } from "react";

/**
 *
 */
export interface PodEvent {
  podName: string;
  phase: "Pending" | "Running" | "Succeeded" | "Failed" | "Unknown";
  startTs: number; // Unix ms
  endTs: number; // Unix ms (or Date.now() if still running)
  restarts: number;
}

interface PodLifecycleGanttProps {
  pods: PodEvent[];
  windowStartMs: number;
  windowEndMs: number;
  title?: string;
}

const PHASE_COLORS: Record<PodEvent["phase"], string> = {
  Pending: "var(--severity-medium)",
  Running: "var(--severity-low)",
  Succeeded: "var(--color-success)",
  Failed: "var(--severity-critical)",
  Unknown: "var(--text-muted)",
};

const ROW_HEIGHT = 28;
const LABEL_WIDTH = 180;

const PodLifecycleGantt: React.FC<PodLifecycleGanttProps> = ({
  pods,
  windowStartMs,
  windowEndMs,
  title = "Pod Lifecycle",
}) => {
  const windowMs = windowEndMs - windowStartMs;

  const rows = useMemo(
    () =>
      pods.map((pod) => {
        const leftPct = Math.max(0, (pod.startTs - windowStartMs) / windowMs) * 100;
        const widthPct = Math.min(100 - leftPct, ((pod.endTs - pod.startTs) / windowMs) * 100);
        return { ...pod, leftPct, widthPct };
      }),
    [pods, windowStartMs, windowMs]
  );

  return (
    <Surface className="chart-card" padding="sm">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        {rows.map((row, i) => (
          <div
            key={row.podName}
            style={{
              display: "flex",
              alignItems: "center",
              height: ROW_HEIGHT,
              borderBottom: i < rows.length - 1 ? "1px solid var(--glass-border)" : "none",
            }}
          >
            {/* Pod label */}
            <div
              style={{
                width: LABEL_WIDTH,
                minWidth: LABEL_WIDTH,
                fontSize: "var(--text-xs)",
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: 8,
              }}
            >
              {row.podName}
            </div>

            {/* Timeline track */}
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 14,
                background: "var(--bg-tertiary)",
                borderRadius: 3,
              }}
            >
              <Tooltip
                content={
                  `${row.podName} — ${row.phase}\n` +
                  `Start: ${new Date(row.startTs).toLocaleTimeString()}\n` +
                  `Restarts: ${row.restarts}`
                }
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${row.leftPct}%`,
                    width: `${Math.max(row.widthPct, 0.5)}%`,
                    height: "100%",
                    background: PHASE_COLORS[row.phase],
                    borderRadius: 3,
                    cursor: "pointer",
                    opacity: 0.85,
                  }}
                />
              </Tooltip>

              {/* Restart markers */}
              {row.restarts > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `calc(${row.leftPct}% + 2px)`,
                    top: -2,
                    fontSize: 8,
                    color: "var(--severity-high)",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ↻{row.restarts}
                </div>
              )}
            </div>

            {/* Phase badge */}
            <div
              style={{
                marginLeft: 8,
                fontSize: "var(--text-xs)",
                color: PHASE_COLORS[row.phase],
                minWidth: 64,
                fontWeight: 500,
              }}
            >
              {row.phase}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No pod data available
          </div>
        )}
      </div>
    </Surface>
  );
};

export default PodLifecycleGantt;
