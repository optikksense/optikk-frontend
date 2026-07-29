export function tsMs(ts: string | number | null | undefined): number {
  if (!ts) return Number.NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? Number.NaN : ms;
}
