import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@shared/utils/formatters";

/**
 *
 */
export interface Alert {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  firedAt: string;
  summary: string;
}

interface AlertGroupCardProps {
  service: string;
  alerts: Alert[];
  onAlertClick?: (id: string) => void;
}

const SEVERITY_COLOR: Record<Alert["severity"], string> = {
  critical: "var(--color-critical, #DC2626)",
  high: "var(--severity-high, #EA580C)",
  medium: "var(--color-degraded, #D97706)",
  low: "var(--color-unknown, #6B7280)",
};

export default function AlertGroupCard({ service, alerts, onAlertClick }: AlertGroupCardProps) {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--card-radius,12px)] border border-[var(--card-border)] bg-card shadow-[var(--card-shadow)]",
        criticalCount > 0 && "border-l-[3px] border-l-critical"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-border-light border-b px-4 py-3">
        <span className="font-semibold text-[color:var(--text-primary)] text-[var(--text-sm,13px)]">
          {service}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[color:var(--text-secondary)] text-[var(--text-xs,11px)]">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alert list */}
      <ul className="m-0 list-none py-1">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex cursor-default items-center gap-2.5 px-4 py-2 transition-[background] duration-120 hover:bg-accent"
            onClick={() => onAlertClick?.(alert.id)}
            role={onAlertClick ? "button" : undefined}
            tabIndex={onAlertClick ? 0 : undefined}
            style={{ cursor: onAlertClick ? "pointer" : "default" }}
          >
            <span
              className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
              style={{ background: SEVERITY_COLOR[alert.severity] }}
            />
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[color:var(--text-primary)] text-[var(--text-sm,13px)]">
              {alert.name}
            </span>
            <span className="flex-shrink-0 text-[color:var(--text-muted)] text-[var(--text-xs,11px)]">
              {formatRelativeTime(alert.firedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
