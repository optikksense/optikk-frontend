import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { SpanRow, SpansQueryRequest, SpansQueryResponse } from "../types/span";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const warningSchema = z.object({ code: z.string(), message: z.string() }).strict();

const spanRowSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  parent_span_id: z.string().optional(),
  service_name: z.string(),
  operation: z.string(),
  kind: z.string().optional(),
  duration_ms: z.coerce.number(),
  timestamp_ns: z.coerce.number(),
  has_error: z.coerce.boolean(),
  status: z.string().optional(),
  http_method: z.string().optional(),
  response_status_code: z.string().optional(),
  environment: z.string().optional(),
});

const responseSchema = z
  .object({
    results: z.union([z.array(spanRowSchema), z.null()]).transform((v) => v ?? []),
    pageInfo: z.unknown().optional(),
    warnings: z.array(z.union([z.string(), warningSchema])).optional(),
  })
  .transform((r) => {
    const out: SpansQueryResponse = {
      spans: r.results as SpanRow[],
      nextCursor: extractNextCursor(r.pageInfo),
      warnings: normalizeWarnings(r.warnings),
    };
    return out;
  });

async function query(body: SpansQueryRequest): Promise<SpansQueryResponse> {
  const raw = await api.post<unknown>(`${BASE}/spans/query`, body);
  return validateResponse(responseSchema, raw);
}

function extractNextCursor(pageInfo: unknown): string | undefined {
  if (pageInfo && typeof pageInfo === "object" && "nextCursor" in pageInfo) {
    const c = (pageInfo as { nextCursor?: string }).nextCursor;
    return c && c !== "" ? c : undefined;
  }
  return undefined;
}

function normalizeWarnings(
  raw: readonly (string | z.infer<typeof warningSchema>)[] | undefined,
): SpansQueryResponse["warnings"] {
  if (!raw?.length) return undefined;
  return raw.map((item) => (typeof item === "string" ? { code: "query", message: item } : item));
}

export const spansExplorerApi = { query };
