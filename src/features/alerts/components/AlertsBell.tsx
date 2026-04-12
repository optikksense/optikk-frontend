// Header bell: polls /api/v1/alerts/incidents every 15s and shows a count
// badge + dropdown of top N firing incidents. Navigates to the rule detail
// page when an incident is clicked.

import { useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/ui";

import { ROUTES } from "@/shared/constants/routes";
import { useAlertIncidents } from "../hooks/useAlerts";
import { RuleStateChip } from "./RuleStateChip";

export function AlertsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { data } = useAlertIncidents({ refetchInterval: 15_000, state: "firing" });
  const incidents = data ?? [];
  // Backend already filters by state=firing; local filter is a safety net.
  const firing = incidents.filter((i) => i.state === "alert" || i.state === "warn");
  const count = firing.length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={
          <span className="relative inline-flex">
            <Bell size={14} />
            {count > 0 && (
              <span className="-right-1 -top-1 absolute inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 font-bold text-[9px] text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
        }
        size="sm"
        variant="ghost"
        label="Alerts"
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-[1000] w-[320px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between border-[var(--border-color)] border-b px-3 py-2">
            <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
              Firing ({count})
            </span>
            <button
              type="button"
              className="text-[11px] text-[var(--color-primary)] hover:underline"
              onClick={() => {
                setOpen(false);
                navigate({ to: ROUTES.alerts as never });
              }}
            >
              Open alerts
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {firing.slice(0, 8).map((inc) => (
              <button
                key={`${inc.alert_id}:${inc.instance_key}`}
                type="button"
                className="flex w-full flex-col gap-1 border-[var(--border-color)] border-b px-3 py-2 text-left last:border-b-0 hover:bg-white/[0.04]"
                onClick={() => {
                  setOpen(false);
                  navigate({
                    to: ROUTES.alertRuleDetail.replace("$ruleId", inc.alert_id) as never,
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <RuleStateChip state={inc.state} />
                  <span className="truncate font-semibold text-[12px]">{inc.rule_name}</span>
                </div>
                <span className="truncate text-[11px] text-[var(--text-muted)]">
                  {Object.entries(inc.group_values ?? {})
                    .map(([k, v]) => `${k}:${v}`)
                    .join(" · ")}
                </span>
              </button>
            ))}
            {count === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-[var(--text-muted)]">
                All quiet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
