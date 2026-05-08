import { z } from "zod";

import type { ExplorerFilter } from "@features/explorer/types/filters";
import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import { buildLogsFilters } from "./buildLogsFilters";

export interface LogsSummary {
  readonly total: number;
  readonly errors: number;
  readonly warns: number;
}

export interface LogsTrendBucket {
  readonly time_bucket: string;
  readonly severity_bucket: number;
  readonly count: number;
}

export interface LogsFacetValue {
  readonly value: string;
  readonly count: number;
}

export interface LogsFacets {
  readonly severity_bucket: readonly string[];
  readonly service: readonly LogsFacetValue[];
  readonly host?: readonly LogsFacetValue[];
  readonly pod?: readonly LogsFacetValue[];
  readonly environment?: readonly LogsFacetValue[];
}

const summarySchema = z
  .object({
    summary: z.object({
      total: z.coerce.number(),
      errors: z.coerce.number(),
      warns: z.coerce.number().default(0),
    }),
  })
  .transform((r): LogsSummary => r.summary);

const trendSchema = z
  .object({
    trend: z
      .array(
        z.object({
          time_bucket: z.string(),
          severity_bucket: z.coerce.number(),
          count: z.coerce.number(),
        })
      )
      .nullable()
      .transform((v) => v ?? []),
  })
  .transform((r): readonly LogsTrendBucket[] => r.trend);

const facetValueSchema = z.object({ value: z.string(), count: z.coerce.number() });

const facetsSchema = z
  .object({
    facets: z.object({
      severity_bucket: z
        .array(z.string())
        .nullable()
        .transform((v) => v ?? []),
      service: z
        .array(facetValueSchema)
        .nullable()
        .transform((v) => v ?? []),
      host: z.array(facetValueSchema).optional(),
      pod: z.array(facetValueSchema).optional(),
      environment: z.array(facetValueSchema).optional(),
    }),
  })
  .transform((r): LogsFacets => r.facets);

export interface LogsAnalyticsArgs {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
}

function buildBody(args: LogsAnalyticsArgs) {
  return buildLogsFilters(args.filters, args.startTime, args.endTime).body;
}

export async function getLogsSummary(args: LogsAnalyticsArgs): Promise<LogsSummary> {
  const raw = await api.post<unknown>("/v1/logs/summary", buildBody(args));
  return validateResponse(summarySchema, raw);
}

export async function getLogsTrend(args: LogsAnalyticsArgs): Promise<readonly LogsTrendBucket[]> {
  const raw = await api.post<unknown>("/v1/logs/trend", buildBody(args));
  return validateResponse(trendSchema, raw);
}

export async function getLogsFacets(args: LogsAnalyticsArgs): Promise<LogsFacets> {
  const raw = await api.post<unknown>("/v1/logs/facets", buildBody(args));
  return validateResponse(facetsSchema, raw);
}
