import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

interface SignalTotals {
  readonly logs: number;
  readonly spans: number;
  readonly metricDatapoints: number;
  readonly records: number;
  readonly logsBytes: number;
  readonly spansBytes: number;
  readonly metricBytes: number;
  readonly bytes: number;
}

interface TypeShare {
  readonly type: string;
  readonly label: string;
  readonly records: number;
  readonly pct: number;
  readonly bytes: number;
  readonly bytesPct: number;
}

export interface IngestionSummary {
  readonly totals: SignalTotals;
  readonly activeTimeseries: number;
  readonly topCardinalityMetric: { readonly name: string; readonly timeseries: number };
  readonly dailyAverage: number;
  readonly dailyAverageBytes: number;
  readonly peak: { readonly date: string; readonly records: number; readonly bytes: number };
  readonly daysElapsed: number;
  readonly daysInMonth: number;
  readonly projectedRecords: number;
  readonly projectedBytes: number;
  readonly commitmentRecords: number;
  readonly commitmentBytes: number;
  readonly commitmentUsedPct: number;
  readonly commitmentUsedBytesPct: number;
  readonly projectedPct: number;
  readonly projectedBytesPct: number;
  readonly onPace: boolean;
  readonly onPaceBytes: boolean;
  readonly byType: readonly TypeShare[];
}

export interface TimeseriesSeries {
  readonly id: string;
  readonly label: string;
  readonly data: readonly number[];
  readonly byteData: readonly number[];
}

export interface IngestionTimeseries {
  readonly groupBy: string;
  readonly dates: readonly string[];
  readonly series: readonly TimeseriesSeries[];
}

export interface IngestionServiceRow {
  readonly name: string;
  readonly env: string;
  readonly logs: number;
  readonly spans: number;
  readonly timeseries: number;
  readonly total: number;
  readonly bytes: number;
  readonly pct: number;
  readonly bytesPct: number;
  readonly deltaPct: number;
  readonly spark: readonly number[];
  readonly byteSpark: readonly number[];
}

export interface IngestionServices {
  readonly services: readonly IngestionServiceRow[];
  readonly totalServices: number;
  readonly topSharePct: number;
  readonly topShareBytesPct: number;
}

function range(s: RequestTime, e: RequestTime) {
  return { startTime: s, endTime: e };
}

export function getIngestionSummary(s: RequestTime, e: RequestTime): Promise<IngestionSummary> {
  return api.get<IngestionSummary>(`${V1}/ingestion/summary`, { params: range(s, e) });
}

export function getIngestionTimeseries(
  s: RequestTime,
  e: RequestTime,
  groupBy: "type" | "service"
): Promise<IngestionTimeseries> {
  return api.get<IngestionTimeseries>(`${V1}/ingestion/timeseries`, {
    params: { ...range(s, e), groupBy },
  });
}

export function getIngestionServices(s: RequestTime, e: RequestTime): Promise<IngestionServices> {
  return api.get<IngestionServices>(`${V1}/ingestion/services`, { params: range(s, e) });
}
