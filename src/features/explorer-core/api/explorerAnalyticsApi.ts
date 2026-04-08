import { z } from "zod";

import api from "@/shared/api/api/client";
import { decodeApiResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const aggregationSchema = z
  .object({
    function: z.string(),
    field: z.string().optional(),
    alias: z.string(),
  })
  .strict();

export const analyticsRequestSchema = z
  .object({
    query: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    groupBy: z.array(z.string()),
    aggregations: z.array(aggregationSchema),
    orderBy: z.string().optional(),
    orderDir: z.string().optional(),
    limit: z.number().optional(),
    step: z.string().optional(),
    vizMode: z.string().optional(),
  })
  .strict();

export type ExplorerAnalyticsRequest = z.infer<typeof analyticsRequestSchema>;

const cellSchema = z
  .object({
    key: z.string(),
    type: z.string(),
    stringValue: z.string().optional(),
    integerValue: z.number().optional(),
    numberValue: z.number().optional(),
  })
  .strict();

const rowSchema = z.object({ cells: z.array(cellSchema) }).strict();

const analyticsResultSchema = z
  .object({
    columns: z.array(z.string()),
    rows: z.array(rowSchema),
  })
  .strict();

export type ExplorerAnalyticsResult = z.infer<typeof analyticsResultSchema>;

export const explorerAnalyticsApi = {
  async query(
    scope: "logs" | "traces",
    body: ExplorerAnalyticsRequest
  ): Promise<ExplorerAnalyticsResult> {
    const response = await api.post(`${BASE}/explorer/${scope}/analytics`, body);
    return decodeApiResponse(analyticsResultSchema, response, {
      context: `explorer analytics (${scope})`,
      expectedType: "object",
      message: "Invalid explorer analytics response",
    });
  },
};
