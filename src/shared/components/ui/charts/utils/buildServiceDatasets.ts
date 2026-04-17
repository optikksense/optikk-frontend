import { firstValue, tsKey, tsMs } from "@shared/utils/chartDataUtils";

type ChartRow = Record<string, unknown>;

export interface ServiceDataset {
  label: string;
  values: number[];
  color: string;
  fill: boolean;
}

export interface BuildServiceDatasetsOptions<Ep, Acc> {
  endpoints: readonly Ep[];
  timeBuckets: string[];
  serviceTimeseriesMap: Record<string, ChartRow[]>;
  getColor: (idx: number) => string;
  getSelectionKey: (ep: Ep) => string;
  getLabel: (ep: Ep, selectionKey: string) => string;
  getRowsForKey?: (selectionKey: string, ep: Ep) => ChartRow[];
  initialAcc: () => Acc;
  reduceRow: (acc: Acc, row: ChartRow) => Acc;
  computeValue: (acc: Acc | undefined) => number;
}

export function buildServiceDatasets<Ep, Acc>(
  options: BuildServiceDatasetsOptions<Ep, Acc>
): ServiceDataset[] {
  const {
    endpoints,
    timeBuckets,
    serviceTimeseriesMap,
    getColor,
    getSelectionKey,
    getLabel,
    getRowsForKey,
    initialAcc,
    reduceRow,
    computeValue,
  } = options;

  const targetMap: Record<string, { label: string; ep: Ep }> = {};
  for (const ep of endpoints) {
    const key = getSelectionKey(ep);
    if (!targetMap[key]) targetMap[key] = { label: getLabel(ep, key), ep };
  }

  const stepMs =
    timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60000;

  return Object.entries(targetMap).map(([key, info], idx) => {
    const tsData = getRowsForKey
      ? getRowsForKey(key, info.ep)
      : serviceTimeseriesMap[key] || [];

    const tsMap: Record<string, Acc> = {};
    for (const row of tsData) {
      const rowTimestamp = firstValue(row, ["timestamp", "time_bucket", "timeBucket"], "");
      if (!rowTimestamp) continue;
      const rowTime = tsMs(rowTimestamp);
      if (!Number.isFinite(rowTime)) continue;
      const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
      const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
      if (!(bucketKey in tsMap)) tsMap[bucketKey] = initialAcc();
      tsMap[bucketKey] = reduceRow(tsMap[bucketKey], row);
    }

    const values = timeBuckets.map((d) => computeValue(tsMap[tsKey(d)]));
    return { label: info.label, values, color: getColor(idx), fill: false };
  });
}
