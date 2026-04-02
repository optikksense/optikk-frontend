import { RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

import { TimeRangePicker } from '@shared/components/ui/TimeSelector';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import { useTimeRangeURL } from '@shared/hooks/useTimeRangeURL';
import { IconButton, Tooltip, Select } from '@/components/ui';
import { resolveTimeRangeBounds, timeRangeDurationMs, isRelativeRange } from '@/types';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { AUTO_REFRESH_INTERVALS } from '@config/constants';

import { cn } from '@/lib/utils';

export default function Header() {
  const { user } = useAuthStore();
  const {
    selectedTeamIds,
    setSelectedTeamIds,
    triggerRefresh,
    autoRefreshInterval,
    setAutoRefreshInterval,
    timeRange,
    setCustomTimeRange,
  } = useAppStore();
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
    toast.success('Data refreshed');
  };

  const shiftTimeRange = useCallback(
    (direction: 'back' | 'forward') => {
      const durationMs = timeRangeDurationMs(timeRange);
      const shiftMs = Math.round(durationMs / 2);
      const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
      const now = Date.now();

      let newStart: number;
      let newEnd: number;
      if (direction === 'back') {
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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    <header className="relative z-[200] flex h-[var(--space-header-h,56px)] items-center justify-between gap-3 overflow-visible border-b border-[var(--border-color)] bg-[var(--bg-overlay)] px-4 backdrop-blur-[12px] max-md:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-visible">
        {/* Shift back */}
        <Tooltip content="Shift time window back">
          <IconButton
            icon={<ChevronLeft size={14} />}
            size="sm"
            variant="ghost"
            label="Shift back"
            onClick={() => shiftTimeRange('back')}
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
            onClick={() => shiftTimeRange('forward')}
          />
        </Tooltip>

        {/* Live indicator */}
        {isLive && (
          <span className="inline-flex items-center gap-1 rounded-[var(--card-radius)] border border-[rgba(115,201,145,0.28)] bg-[rgba(115,201,145,0.12)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-success)] shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="ml-auto flex min-w-0 shrink items-center gap-2.5">
        {teams.length > 0 && (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] tracking-wide uppercase text-[var(--text-muted)] whitespace-nowrap max-[1240px]:hidden">
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
          <Tooltip content={`Refresh now${refreshLabel ? ` · ${refreshLabel}` : ''}`}>
            <button
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-l-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[background-color,border-color,color] hover:bg-white/[0.06] hover:text-[var(--text-primary)]',
                autoRefreshInterval && 'text-[var(--color-primary)]'
              )}
              onClick={handleRefresh}
            >
              <RefreshCw
                size={14}
                className={cn(autoRefreshInterval && 'animate-spin')}
                style={autoRefreshInterval ? { animationDuration: '2s' } : undefined}
              />
            </button>
          </Tooltip>

          <button
            className={cn(
              'inline-flex h-9 items-center gap-1 rounded-r-[var(--card-radius)] border border-l-0 border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-2.5 pr-2.5 text-[12px] font-medium whitespace-nowrap text-[var(--text-muted)] shadow-[var(--shadow-sm)] transition-[background-color,border-color,color] hover:bg-white/[0.06] hover:text-[var(--text-primary)]',
              autoRefreshInterval && 'text-[var(--color-primary)]'
            )}
            onClick={() => setIntervalPickerOpen((v) => !v)}
          >
            {activeInterval.value ? activeInterval.label : ''}
            <ChevronDown size={10} />
          </button>

          {intervalPickerOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[1000] min-w-[132px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-[var(--shadow-md)]">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                Auto-refresh
              </div>
              {AUTO_REFRESH_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  className={cn(
                    'flex w-full items-center border-none bg-none px-3 py-2 text-left text-[12px] whitespace-nowrap text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]',
                    opt.value === autoRefreshInterval &&
                      'bg-[var(--color-primary-subtle-10)] font-semibold text-[var(--color-primary)]'
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
