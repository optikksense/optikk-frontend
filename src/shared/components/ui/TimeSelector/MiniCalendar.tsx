import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAYS, MONTHS } from "./constants";
import { dayInRange } from "./utils";
import "./TimeSelector.css";

interface MiniCalendarProps {
  fromDate: Date | null;
  toDate: Date | null;
  onSelectDate: (d: Date) => void;
  calMonth: number;
  calYear: number;
  setCalMonth: (m: number) => void;
  setCalYear: (y: number) => void;
}

export function MiniCalendar({
  fromDate,
  toDate,
  onSelectDate,
  calMonth,
  calYear,
  setCalMonth,
  setCalYear,
}: MiniCalendarProps) {
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const firstDay = new Date(calYear, calMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const cells: Array<{ day: number; current: boolean }> = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const isFrom = (d: number) =>
    fromDate &&
    d === fromDate.getDate() &&
    calMonth === fromDate.getMonth() &&
    calYear === fromDate.getFullYear();
  const isTo = (d: number) =>
    toDate &&
    d === toDate.getDate() &&
    calMonth === toDate.getMonth() &&
    calYear === toDate.getFullYear();
  const isInRange = (d: number) => {
    if (!fromDate || !toDate) return false;
    const cellDate = new Date(calYear, calMonth, d);
    return dayInRange(cellDate, fromDate, toDate);
  };

  return (
    <div className="mb-1">
      {/* Nav row */}
      <div className="mb-0.5 flex items-center justify-between">
        <button
          type="button"
          className="flex cursor-pointer items-center rounded border border-[#2a2a35] bg-transparent p-0.5 text-[#666] transition-all duration-100 hover:border-[#3a3a48] hover:text-white"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="font-semibold text-[11px] text-[rgba(255,255,255,0.85)]">
          {MONTHS[calMonth]} {calYear}
        </span>
        <button
          type="button"
          className="flex cursor-pointer items-center rounded border border-[#2a2a35] bg-transparent p-0.5 text-[#666] transition-all duration-100 hover:border-[#3a3a48] hover:text-white"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-[1px] text-center font-semibold text-[9px] text-primary opacity-60"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const isRangeStart = c.current && !!isFrom(c.day);
          const isRangeEnd = c.current && !!isTo(c.day);
          const inRange = c.current && isInRange(c.day);
          const isTodayCell = c.current && isToday(c.day) && !isRangeStart && !isRangeEnd;

          return (
            <button
              type="button"
              key={i}
              className={cn(
                "trp-cal__day relative cursor-pointer border-none bg-transparent py-[2px] text-center text-[10px] leading-[1.25] transition-all duration-[80ms]",
                !c.current &&
                  "trp-cal__day--other cursor-default text-[rgba(255,255,255,0.12)] hover:bg-transparent hover:text-[rgba(255,255,255,0.12)]",
                isTodayCell && "trp-cal__day--today font-bold text-primary",
                !isRangeStart &&
                  !isRangeEnd &&
                  !inRange &&
                  !isTodayCell &&
                  c.current &&
                  "rounded-sm text-[rgba(255,255,255,0.55)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
                (isRangeStart || isRangeEnd) && "trp-cal__day--range-start-or-end",
                isRangeStart &&
                  "trp-cal__day--range-start z-[1] bg-primary font-bold text-white shadow-[0_2px_8px_var(--color-primary-subtle-35)]",
                isRangeEnd &&
                  "trp-cal__day--range-end z-[1] bg-primary font-bold text-white shadow-[0_2px_8px_var(--color-primary-subtle-35)]",
                inRange &&
                  "trp-cal__day--in-range bg-[var(--color-primary-subtle-18)] text-[rgba(255,255,255,0.9)]"
              )}
              onClick={() => {
                if (c.current) onSelectDate(new Date(calYear, calMonth, c.day));
              }}
              tabIndex={c.current ? 0 : -1}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
