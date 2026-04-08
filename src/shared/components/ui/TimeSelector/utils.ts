const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function parseDatetime(str: string): Date | null {
  const d = new Date(str.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dayInRange(day: Date, from: Date | null, to: Date | null) {
  if (!from || !to) return false;
  const t = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return t > Math.min(a, b) && t < Math.max(a, b);
}
