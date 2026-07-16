export function parseBucketMs(time_bucket: string, idx: number): number {
  const iso = time_bucket.includes("T") ? time_bucket : time_bucket.replace(" ", "T");
  const utc = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = Date.parse(utc);
  return Number.isNaN(ms) ? idx : ms;
}
