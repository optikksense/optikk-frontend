export interface TrendBucket {
  readonly ts: number;
  readonly counts: Readonly<Record<string, number>>;
}
