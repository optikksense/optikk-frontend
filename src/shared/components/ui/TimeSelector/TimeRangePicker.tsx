import { Clock, ChevronDown, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

import type { TimeRange } from '@/types';

import { useTimeRange, useAppStore } from '@app/store/appStore';

import { RANGE_GROUPS, DISPLAY_MAP } from './constants';
import { fmtDatetime, parseDatetime } from './utils';
import { DualCalendar } from './DualCalendar';
import './TimeSelector.css';

type Tab = 'relative' | 'absolute';

export default function TimeRangePicker() {
  const timeRange = useTimeRange();
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('relative');

  // Calendar state
  const now = new Date();
  const [leftMonth, setLeftMonth] = useState(() => subMonths(now, 1));
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingMode, setSelectingMode] = useState(false);

  // Time input fields
  const [fromStr, setFromStr] = useState(fmtDatetime(new Date(now.getTime() - 3600000)));
  const [toStr, setToStr] = useState(fmtDatetime(now));

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleToggle = useCallback(() => {
    if (!open) {
      const n = new Date();
      const durationMs =
        timeRange.kind === 'relative'
          ? timeRange.minutes * 60000
          : timeRange.endMs - timeRange.startMs;
      const startDate = new Date(n.getTime() - durationMs);
      setFromStr(fmtDatetime(startDate));
      setToStr(fmtDatetime(n));
      setLeftMonth(subMonths(n, 1));
      setRangeStart(startDate);
      setRangeEnd(n);
      setSelectingMode(false);
      setHoverDate(null);
      setActiveTab(timeRange.kind === 'absolute' ? 'absolute' : 'relative');
    }
    setOpen((v) => !v);
  }, [open, timeRange]);

  const selectRange = (range: TimeRange) => {
    setTimeRange(range);
    setOpen(false);
  };

  const handleCalSelect = (date: Date) => {
    if (!selectingMode || !rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectingMode(true);
      setFromStr(fmtDatetime(date));
    } else {
      const start = date < rangeStart ? date : rangeStart;
      const end = date < rangeStart ? rangeStart : date;
      setRangeStart(start);
      setRangeEnd(end);
      setSelectingMode(false);
      setFromStr(fmtDatetime(start));
      setToStr(fmtDatetime(end));
    }
  };

  const applyAbsolute = () => {
    const start = parseDatetime(fromStr);
    const end = parseDatetime(toStr);
    if (!start || !end || start >= end) return;
    const label = `${fmtDatetime(start)} to ${fmtDatetime(end)}`;
    setCustomTimeRange(start.getTime(), end.getTime(), label);
    setOpen(false);
  };

  const displayLabel =
    timeRange.kind === 'absolute'
      ? `${fmtDatetime(new Date(timeRange.startMs))} to ${fmtDatetime(new Date(timeRange.endMs))}`
      : DISPLAY_MAP[timeRange.preset] || timeRange.label || 'Last 30 minutes';

  const isActivePreset = (preset: string): boolean =>
    timeRange.kind === 'relative' && timeRange.preset === preset;

  // Current expression display
  const fromExpr =
    timeRange.kind === 'relative'
      ? `now-${timeRange.preset}`
      : fmtDatetime(new Date(timeRange.startMs));
  const toExpr = timeRange.kind === 'relative' ? 'now' : fmtDatetime(new Date(timeRange.endMs));

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        className={cn(
          'inline-flex items-center gap-2 px-3 h-8 rounded-md text-[13px] font-medium cursor-pointer transition-all border',
          'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]',
          'hover:border-[var(--color-primary)] hover:bg-[var(--bg-tertiary)]',
          open && 'border-[var(--color-primary)] bg-[var(--bg-tertiary)]'
        )}
        onClick={handleToggle}
        data-testid="time-range-trigger"
      >
        <Clock size={14} className="text-[var(--color-primary)] shrink-0" />
        <span>{displayLabel}</span>
        <ChevronDown
          size={12}
          className={cn(
            'text-[var(--text-tertiary)] shrink-0 transition-transform duration-150',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl z-[1000] overflow-hidden animate-trp-slide-in max-h-[calc(100vh-70px)]"
          style={{ width: activeTab === 'relative' ? 380 : 560 }}
          role="dialog"
          aria-label="Time range picker"
          data-testid="time-range-dropdown"
        >
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-color)]">
            <button
              className={cn(
                'flex-1 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0',
                activeTab === 'relative'
                  ? 'border-b-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-b-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
              onClick={() => setActiveTab('relative')}
            >
              Relative
            </button>
            <button
              className={cn(
                'flex-1 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0',
                activeTab === 'absolute'
                  ? 'border-b-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-b-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
              onClick={() => setActiveTab('absolute')}
            >
              Absolute
            </button>
          </div>

          {activeTab === 'relative' ? (
            <div className="flex flex-col">
              {/* Current range expression bar */}
              <div className="px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      From
                    </div>
                    <div className="px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[13px] font-mono text-[var(--color-primary)]">
                      {fromExpr}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-tertiary)] mt-4 shrink-0" />
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      To
                    </div>
                    <div className="px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[13px] font-mono text-[var(--color-primary)]">
                      {toExpr}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick ranges grid by group */}
              <div className="p-3 overflow-y-auto" style={{ maxHeight: 340 }}>
                {RANGE_GROUPS.map((group, groupIdx) => (
                  <div key={group.title} className={cn(groupIdx > 0 && 'mt-3')}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5 px-1">
                      {group.title}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {group.items.map((item) => {
                        const active = isActivePreset(item.preset);
                        return (
                          <button
                            key={item.preset}
                            className={cn(
                              'group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center cursor-pointer transition-all duration-150 bg-transparent',
                              active
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_12px_rgba(124,127,242,0.15)]'
                                : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--bg-tertiary)]'
                            )}
                            onClick={() => selectRange(item)}
                          >
                            <span
                              className={cn(
                                'text-[13px] font-semibold leading-tight',
                                active
                                  ? 'text-[var(--color-primary)]'
                                  : 'text-[var(--text-primary)] group-hover:text-[var(--color-primary)]'
                              )}
                            >
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Absolute tab — Calendar + time inputs */
            <div className="flex flex-col">
              <DualCalendar
                leftMonth={leftMonth}
                setLeftMonth={setLeftMonth}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                hoverDate={hoverDate}
                selectingMode={selectingMode}
                onSelectDate={handleCalSelect}
                onHoverDate={setHoverDate}
              />

              {/* From / To inputs + Apply */}
              <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)]">
                <div className="flex gap-3 mt-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      From
                    </label>
                    <input
                      className="w-full px-2.5 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] text-[13px] font-mono outline-none transition-colors hover:border-[var(--text-tertiary)] focus:border-[var(--color-primary)]"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      value={fromStr}
                      onChange={(e) => setFromStr(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end pb-1.5 text-[var(--text-tertiary)] text-[13px]">
                    to
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      To
                    </label>
                    <input
                      className="w-full px-2.5 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] text-[13px] font-mono outline-none transition-colors hover:border-[var(--text-tertiary)] focus:border-[var(--color-primary)]"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      value={toStr}
                      onChange={(e) => setToStr(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full mt-3 py-2 bg-[var(--color-primary)] border-none rounded-md text-white text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-90"
                  onClick={applyAbsolute}
                >
                  Apply time range
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
