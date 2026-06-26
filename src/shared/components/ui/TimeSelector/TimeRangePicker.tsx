import { cn } from "@/lib/utils";
import { subMonths } from "date-fns";
import { ArrowRight, ChevronDown, Clock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { TimeRange } from "@/types";

import { useAppStore, useTimeRange } from "@app/store/appStore";

import { DualCalendar } from "./DualCalendar";
import { DISPLAY_MAP, RANGE_GROUPS } from "./constants";
import { fmtDatetime, parseDatetime } from "./utils";

type Tab = "relative" | "absolute";

export default function TimeRangePicker() {
  const timeRange = useTimeRange();
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("relative");

  // Calendar state
  const now = new Date();
  const [leftMonth, setLeftMonth] = useState(() => subMonths(now, 1));
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingMode, setSelectingMode] = useState(false);

  const [fromStr, setFromStr] = useState(fmtDatetime(new Date(now.getTime() - 3600000)));
  const [toStr, setToStr] = useState(fmtDatetime(now));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleToggle = useCallback(() => {
    if (!open) {
      const n = new Date();
      const durationMs =
        timeRange.kind === "relative"
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
      setActiveTab(timeRange.kind === "absolute" ? "absolute" : "relative");
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
    timeRange.kind === "absolute"
      ? `${fmtDatetime(new Date(timeRange.startMs))} to ${fmtDatetime(new Date(timeRange.endMs))}`
      : DISPLAY_MAP[timeRange.preset] || timeRange.label || "Last 30 minutes";

  const isActivePreset = (preset: string): boolean =>
    timeRange.kind === "relative" && timeRange.preset === preset;

  const fromExpr =
    timeRange.kind === "relative"
      ? `now-${timeRange.preset}`
      : fmtDatetime(new Date(timeRange.startMs));
  const toExpr = timeRange.kind === "relative" ? "now" : fmtDatetime(new Date(timeRange.endMs));

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      {}
      <button
        type="button"
        className={cn(
          "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border px-3 font-medium text-[13px] transition-all",
          "border-border bg-secondary text-foreground",
          "hover:border-primary hover:bg-muted",
          open && "border-primary bg-muted"
        )}
        onClick={handleToggle}
        data-testid="time-range-trigger"
      >
        <Clock size={14} className="shrink-0 text-primary" />
        <span>{displayLabel}</span>
        <ChevronDown
          size={12}
          className={cn(
            "shrink-0 text-foreground-tertiary transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-[1000] max-h-[calc(100vh-70px)] animate-trp-slide-in overflow-hidden rounded-lg border border-border bg-secondary shadow-xl"
          style={{ width: activeTab === "relative" ? 380 : 560 }}
          role="dialog"
          aria-label="Time range picker"
          data-testid="time-range-dropdown"
        >
          {}
          <div className="flex border-border border-b">
            <button
              type="button"
              className={cn(
                "flex-1 cursor-pointer border-x-0 border-t-0 border-b-2 bg-transparent py-2.5 font-medium text-[13px] transition-colors",
                activeTab === "relative"
                  ? "border-b-primary text-primary"
                  : "border-b-transparent text-foreground-secondary hover:text-foreground"
              )}
              onClick={() => setActiveTab("relative")}
            >
              Relative
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 cursor-pointer border-x-0 border-t-0 border-b-2 bg-transparent py-2.5 font-medium text-[13px] transition-colors",
                activeTab === "absolute"
                  ? "border-b-primary text-primary"
                  : "border-b-transparent text-foreground-secondary hover:text-foreground"
              )}
              onClick={() => setActiveTab("absolute")}
            >
              Absolute
            </button>
          </div>

          {activeTab === "relative" ? (
            <div className="flex flex-col">
              {}
              <div className="border-border border-b bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
                      From
                    </div>
                    <div className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-[13px] text-primary">
                      {fromExpr}
                    </div>
                  </div>
                  <ArrowRight size={14} className="mt-4 shrink-0 text-foreground-tertiary" />
                  <div className="flex-1">
                    <div className="mb-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
                      To
                    </div>
                    <div className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-[13px] text-primary">
                      {toExpr}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="overflow-y-auto p-3" style={{ maxHeight: 340 }}>
                {RANGE_GROUPS.map((group, groupIdx) => (
                  <div key={group.title} className={cn(groupIdx > 0 && "mt-3")}>
                    <div className="mb-1.5 px-1 font-semibold text-[10px] text-foreground-tertiary uppercase tracking-wider">
                      {group.title}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {group.items.map((item) => {
                        const active = isActivePreset(item.preset);
                        return (
                          <button
                            type="button"
                            key={item.preset}
                            className={cn(
                              "group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border bg-transparent px-2 py-2.5 text-center transition-all duration-150",
                              active
                                ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(124,127,242,0.15)]"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            )}
                            onClick={() => selectRange(item)}
                          >
                            <span
                              className={cn(
                                "font-semibold text-[13px] leading-tight",
                                active ? "text-primary" : "text-foreground group-hover:text-primary"
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

              {}
              <div className="border-border border-t px-3 pt-1 pb-3">
                <div className="mt-3 flex gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="font-semibold text-[11px] text-foreground-tertiary uppercase tracking-wider">
                      From
                    </label>
                    <input
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[13px] text-foreground outline-none transition-colors hover:border-foreground-tertiary focus:border-primary"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      value={fromStr}
                      onChange={(e) => setFromStr(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end pb-1.5 text-[13px] text-foreground-tertiary">
                    to
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="font-semibold text-[11px] text-foreground-tertiary uppercase tracking-wider">
                      To
                    </label>
                    <input
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[13px] text-foreground outline-none transition-colors hover:border-foreground-tertiary focus:border-primary"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      value={toStr}
                      onChange={(e) => setToStr(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full cursor-pointer rounded-md border-none bg-primary py-2 font-semibold text-[13px] text-white transition-opacity hover:opacity-90"
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
