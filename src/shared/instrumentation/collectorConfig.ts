import type { IngestionEndpoints } from "@shared/api/ingestionEndpoints";

export const API_KEY_PLACEHOLDER = "<YOUR_API_KEY>";

/**
 * OTel Collector config that receives OTLP locally and forwards every
 * signal to Optikk over OTLP/HTTP. `apiKeyValue` is either the literal
 * key or an env reference like "${OPTIKK_API_KEY}".
 */
export function collectorConfigLines(
  endpoints: IngestionEndpoints,
  apiKeyValue: string
): readonly string[] {
  return [
    "receivers:",
    "  otlp:",
    "    protocols:",
    "      grpc: { endpoint: 0.0.0.0:4317 }",
    "      http: { endpoint: 0.0.0.0:4318 }",
    "processors:",
    "  batch: {}",
    "exporters:",
    "  otlphttp/optikk:",
    `    endpoint: ${endpoints.http}`,
    "    headers:",
    `      ${endpoints.headerName}: ${apiKeyValue}`,
    "service:",
    "  pipelines:",
    "    traces:  { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
    "    metrics: { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
    "    logs:    { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
  ];
}
