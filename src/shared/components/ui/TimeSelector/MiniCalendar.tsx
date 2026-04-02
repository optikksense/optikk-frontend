import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MONTHS, DAYS } from './constants';
import { dayInRange } from './utils';
import './TimeSelector.css';

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
      <div className="flex items-center justify-between mb-0.5">
        <button
          className="bg-transparent border border-[#2a2a35] rounded text-[#666] cursor-pointer p-0.5 flex items-center transition-all duration-100 hover:text-white hover:border-[#3a3a48]"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="text-[11px] font-semibold text-[rgba(255,255,255,0.85)]">
          {MONTHS[calMonth]} {calYear}
        </span>
        <button
          className="bg-transparent border border-[#2a2a35] rounded text-[#666] cursor-pointer p-0.5 flex items-center transition-all duration-100 hover:text-white hover:border-[#3a3a48]"
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
            className="text-[9px] font-semibold text-primary text-center py-[1px] opacity-60"
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
              key={i}
              className={cn(
                'trp-cal__day bg-transparent border-none text-[10px] py-[2px] cursor-pointer text-center transition-all duration-[80ms] leading-[1.25] relative',
                !c.current &&
                  'trp-cal__day--other text-[rgba(255,255,255,0.12)] hover:bg-transparent hover:text-[rgba(255,255,255,0.12)] cursor-default',
                isTodayCell && 'trp-cal__day--today text-primary font-bold',
                !isRangeStart &&
                  !isRangeEnd &&
                  !inRange &&
                  !isTodayCell &&
                  c.current &&
                  'text-[rgba(255,255,255,0.55)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white rounded-sm',
                (isRangeStart || isRangeEnd) && 'trp-cal__day--range-start-or-end',
                isRangeStart &&
                  'trp-cal__day--range-start bg-primary text-white font-bold shadow-[0_2px_8px_var(--color-primary-subtle-35)] z-[1]',
                isRangeEnd &&
                  'trp-cal__day--range-end bg-primary text-white font-bold shadow-[0_2px_8px_var(--color-primary-subtle-35)] z-[1]',
                inRange &&
                  'trp-cal__day--in-range bg-[var(--color-primary-subtle-18)] text-[rgba(255,255,255,0.9)]'
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
