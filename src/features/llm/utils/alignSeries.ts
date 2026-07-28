import type { LlmSeries } from "../api/llmApi";

export interface AlignedSeries {
                                   
  timestamps: number[];
  values: Map<string, Array<number | null>>;
}

                                                                          
export function alignSeries(series: LlmSeries[]): AlignedSeries {
  const bucketSet = new Set<number>();
  for (const s of series) {
    for (const p of s.points ?? []) bucketSet.add(p.t);
  }
  const bucketsMs = [...bucketSet].sort((a, b) => a - b);
  const index = new Map(bucketsMs.map((t, i) => [t, i]));

  const values = new Map<string, Array<number | null>>();
  for (const s of series) {
    const row: Array<number | null> = new Array(bucketsMs.length).fill(null);
    for (const p of s.points ?? []) {
      const i = index.get(p.t);
      if (i !== undefined) row[i] = p.value;
    }
    values.set(s.key, row);
  }
  return { timestamps: bucketsMs.map((t) => Math.floor(t / 1000)), values };
}
