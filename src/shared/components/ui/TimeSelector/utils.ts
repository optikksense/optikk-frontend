const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function parseDatetime(str: string): Date | null {
  const d = new Date(str.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Calendar date helpers (native Date; day-of-month clamped like date-fns).

export function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

export function subMonths(date: Date, amount: number): Date {
  return addMonths(date, -amount);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function daysOfMonth(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const days: Date[] = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push(new Date(year, monthIndex, day));
  }
  return days;
}

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR_FORMAT.format(date);
}
