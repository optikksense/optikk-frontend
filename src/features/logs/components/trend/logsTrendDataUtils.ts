export function parseBucketMs(timeBucket: string, idx: number): number {
  const iso = timeBucket.includes("T") ? timeBucket : timeBucket.replace(" ", "T");
  const utc = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = Date.parse(utc);
  return Number.isNaN(ms) ? idx : ms;
}
