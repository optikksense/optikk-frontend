import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { IconButton, Select, Tooltip } from "@/components/ui";
import { isRelativeRange, resolveTimeRangeBounds, timeRangeDurationMs } from "@/types";
import { TimeRangePicker } from "@shared/components/ui/TimeSelector";
import { useAutoRefresh } from "@shared/hooks/useAutoRefresh";
import { useTimeRangeURL } from "@shared/hooks/useTimeRangeURL";

import { useAppStore, useSidebarCollapsed, useTeamId, useTeamIds, useTheme } from "@store/appStore";
import { useAuthStore, useAuthTenant, useAuthUser } from "@store/authStore";

import { AUTO_REFRESH_INTERVALS } from "@config/constants";

import { cn } from "@/lib/utils";

export default function Header() {
  const user = useAuthUser();
  const tenant = useAuthTenant();
  const logout = useAuthStore((s) => s.logout);
  const theme = useTheme();
  const selectedTeamId = useTeamId();
  const selectedTeamIds = useTeamIds();
  const sidebarCollapsed = useSidebarCollapsed();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSelectedTeamId = useAppStore((s) => s.setSelectedTeamId);
  const setSelectedTeamIds = useAppStore((s) => s.setSelectedTeamIds);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const autoRefreshInterval = useAppStore((s) => s.autoRefreshInterval);
  const setAutoRefreshInterval = useAppStore((s) => s.setAutoRefreshInterval);
  const timeRange = useAppStore((s) => s.timeRange);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const [intervalPickerOpen, setIntervalPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { refreshLabel, triggerRefresh: triggerHeaderRefresh } = useAutoRefresh({
    autoRefreshInterval,
    onRefresh: triggerRefresh,
  });

  // Bidirectional URL sync
  useTimeRangeURL();

  const handleRefresh = () => {
    triggerHeaderRefresh();
  };

  const shiftTimeRange = useCallback(
    (direction: "back" | "forward") => {
      const durationMs = timeRangeDurationMs(timeRange);
      const shiftMs = Math.round(durationMs / 2);
      const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
      const now = Date.now();

      let newStart: number;
      let newEnd: number;
      if (direction === "back") {
        newStart = startTime - shiftMs;
        newEnd = endTime - shiftMs;
      } else {
        newStart = startTime + shiftMs;
        newEnd = Math.min(endTime + shiftMs, now);
        // Don't let start go past now either
        if (newStart >= now) {
          newStart = now - durationMs;
          newEnd = now;
        }
      }
      setCustomTimeRange(newStart, newEnd);
    },
    [timeRange, setCustomTimeRange]
  );

  useEffect(() => {
    if (!intervalPickerOpen) return;
    const handler = (event: MouseEvent): void => {
      if (
        pickerRef.current &&
        event.target instanceof Node &&
        !pickerRef.current.contains(event.target)
      ) {
        setIntervalPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [intervalPickerOpen]);

  const activeInterval =
    AUTO_REFRESH_INTERVALS.find((o) => o.value === autoRefreshInterval) ||
    AUTO_REFRESH_INTERVALS[0];

  const isLive = autoRefreshInterval > 0 && isRelativeRange(timeRange);

  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.orgName ? `${team.orgName} / ${team.name}` : team.name,
    value: team.id,
  }));

  return (
    <header className="relative z-[200] flex h-[var(--space-header-h,56px)] items-center justify-between gap-3 overflow-visible border-[var(--border-color)] border-b bg-[var(--bg-overlay)] px-4 backdrop-blur-[12px] max-md:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-visible">
        {/* Shift back */}
        <Tooltip content="Shift time window back">
          <IconButton
            icon={<ChevronLeft size={14} />}
            size="sm"
            variant="ghost"
            label="Shift back"
            onClick={() => shiftTimeRange("back")}
          />
        </Tooltip>

        <TimeRangePicker />

        {/* Shift forward */}
        <Tooltip content="Shift time window forward">
          <IconButton
            icon={<ChevronRight size={14} />}
            size="sm"
            variant="ghost"
            label="Shift forward"
            onClick={() => shiftTimeRange("forward")}
          />
        </Tooltip>

        {/* Live indicator */}
        {isLive && (
          <span className="inline-flex items-center gap-1 rounded-[var(--card-radius)] border border-[rgba(115,201,145,0.28)] bg-[rgba(115,201,145,0.12)] px-2.5 py-1 font-semibold text-[11px] text-[var(--color-success)] uppercase tracking-[0.06em] shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            Live
          </span>
        )}
      </div>

      <div className="ml-auto flex min-w-0 shrink items-center gap-2.5">
        {teams.length > 0 && (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="whitespace-nowrap text-[11px] text-[var(--text-muted)] uppercase tracking-wide max-[1240px]:hidden">
              Workspace
            </span>
            <Select
              multiple
              value={selectedTeamIds}
              onChange={(val) => setSelectedTeamIds(val as number[])}
              options={teamOptions}
              style={{ width: 220 }}
              placeholder="Select team"
              size="sm"
            />
          </div>
        )}

        {/* Combined refresh picker */}
        <div className="relative flex items-center" ref={pickerRef}>
          <Tooltip content={`Refresh now${refreshLabel ? ` · ${refreshLabel}` : ""}`}>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-l-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[background-color,border-color,color] hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
                autoRefreshInterval && "text-[var(--color-primary)]"
              )}
              onClick={handleRefresh}
            >
              <RefreshCw
                size={14}
                className={cn(autoRefreshInterval && "animate-spin")}
                style={autoRefreshInterval ? { animationDuration: "2s" } : undefined}
              />
            </button>
          </Tooltip>

          <button
            type="button"
            className={cn(
              "inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-r-[var(--card-radius)] border border-[var(--border-color)] border-l-0 bg-[var(--bg-tertiary)] pr-2.5 pl-2.5 font-medium text-[12px] text-[var(--text-muted)] shadow-[var(--shadow-sm)] transition-[background-color,border-color,color] hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
              autoRefreshInterval && "text-[var(--color-primary)]"
            )}
            onClick={() => setIntervalPickerOpen((v) => !v)}
          >
            {activeInterval.value ? activeInterval.label : ""}
            <ChevronDown size={10} />
          </button>

          {intervalPickerOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 z-[1000] min-w-[132px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-[var(--shadow-md)]">
              <div className="px-3 py-1.5 font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
                Auto-refresh
              </div>
              {AUTO_REFRESH_INTERVALS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={cn(
                    "flex w-full items-center whitespace-nowrap border-none bg-none px-3 py-2 text-left text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
                    opt.value === autoRefreshInterval &&
                      "bg-[var(--color-primary-subtle-10)] font-semibold text-[var(--color-primary)]"
                  )}
                  onClick={() => {
                    setAutoRefreshInterval(opt.value);
                    setIntervalPickerOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
