import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import React from "react";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CalendarMonthProps {
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  selectingMode: boolean;
}

export function CalendarMonth({
  currentMonth,
  onSelectDate,
  onHoverDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  selectingMode,
}: CalendarMonthProps) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start, end });

  let startDow = getDay(start);
  startDow = startDow === 0 ? 6 : startDow - 1;

  const padStart = Array(startDow).fill(null);
  const totalCells = padStart.concat(daysInMonth);

  const isInRange = (date: Date) => {
    if (rangeStart && rangeEnd) {
      return date > rangeStart && date < rangeEnd;
    }
    if (selectingMode && rangeStart && hoverDate) {
      const min = rangeStart < hoverDate ? rangeStart : hoverDate;
      const max = rangeStart > hoverDate ? rangeStart : hoverDate;
      return date > min && date < max;
    }
    return false;
  };

  const isStart = (date: Date) => !!rangeStart && isSameDay(date, rangeStart);
  const isEnd = (date: Date) => !!rangeEnd && isSameDay(date, rangeEnd);

  return (
    <div>
      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS.map((d) => (
          <div key={d} className="text-center font-medium text-[11px] text-[var(--text-tertiary)]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {totalCells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const selectedStart = isStart(day);
          const selectedEnd = isEnd(day);
          const selected = selectedStart || selectedEnd;
          const inRange = isInRange(day);
          const today = isToday(day);

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectDate(day)}
              onMouseEnter={() => onHoverDate(day)}
              onMouseLeave={() => onHoverDate(null)}
              className={cn(
                "relative flex h-7 w-full cursor-pointer items-center justify-center border-none text-[12px] outline-none transition-colors",
                selected
                  ? "bg-[var(--color-primary)] font-semibold text-white"
                  : inRange
                    ? "bg-[var(--color-primary)]/15 text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
                selectedStart && "rounded-r-none rounded-l-md",
                selectedEnd && "rounded-r-md rounded-l-none",
                inRange && !selected && "rounded-none",
                !inRange && !selected && "rounded-md"
              )}
            >
              <span className="z-[1]">{format(day, "d")}</span>
              {today && (
                <span
                  className={cn(
                    "-translate-x-1/2 absolute bottom-0.5 left-1/2 h-1 w-1 rounded-full",
                    selected ? "bg-white" : "bg-[var(--color-primary)]"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
