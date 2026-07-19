import api from "@/shared/api/http/client";
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
  readonly commitmentRecords: number;
  readonly commitmentBytes: number;
  readonly commitmentUsedPct: number;
  readonly commitmentUsedBytesPct: number;
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

export interface CostLine {
  readonly category: string;
  readonly unit: string;
  readonly quantity: number;
  readonly rate: number;
  readonly cost: number;
}

export interface IngestionCost {
  readonly currency: string;
  readonly lines: readonly CostLine[];
  readonly currentCost: number;
  readonly daysElapsed: number;
  readonly daysInMonth: number;
}

export interface IngestionOverview {
  readonly summary: IngestionSummary;
  readonly cost: IngestionCost;
  readonly timeseriesByType: IngestionTimeseries;
  readonly timeseriesByService: IngestionTimeseries;
  readonly services: IngestionServices;
  readonly usageSemantics: "attempted" | "accepted";
}

function range(s: RequestTime, e: RequestTime) {
  return { startTime: s, endTime: e };
}

export function getIngestionOverview(
  s: RequestTime,
  e: RequestTime,
  signal?: AbortSignal
): Promise<IngestionOverview> {
  return api.get<IngestionOverview>(`${V1}/ingestion/overview`, {
    params: range(s, e),
    signal,
  });
}
