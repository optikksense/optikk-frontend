const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function parseDatetime(str: string): Date | null {
  const d = new Date(str.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}
