import type { IngestionEndpoints } from "@shared/api/ingestionEndpoints";

import { API_KEY_PLACEHOLDER, collectorConfigLines } from "./collectorConfig";

export interface Snippet {
  readonly id: string;
  readonly label: string;
  readonly code: string;
}

/**
 * Quickstart snippets shown on the welcome page. Each snippet is a
 * copy-paste path to first data using the tenant's real endpoints.
 */
export function buildQuickstartSnippets(
  endpoints: IngestionEndpoints,
  apiKey: string | null
): Snippet[] {
  const key = apiKey ?? API_KEY_PLACEHOLDER;
  return [
    {
      id: "env",
      label: "Env vars",
      code: [
        "# OTLP over HTTP",
        'export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"',
        `export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoints.http}"`,
        `export OTEL_EXPORTER_OTLP_HEADERS="${endpoints.headerName}=${key}"`,
        "",
        "# or OTLP over gRPC",
        '# export OTEL_EXPORTER_OTLP_PROTOCOL="grpc"',
        `# export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoints.grpc}"`,
      ].join("\n"),
    },
    {
      id: "docker",
      label: "Docker",
      code: [
        "cat > otel-collector.yaml <<'EOF'",
        ...collectorConfigLines(endpoints, key),
        "EOF",
        "",
        "docker run --rm -p 4317:4317 -p 4318:4318 \\",
        '  -v "$(pwd)/otel-collector.yaml:/etc/otelcol-contrib/config.yaml" \\',
        "  otel/opentelemetry-collector-contrib:latest",
      ].join("\n"),
    },
    {
      id: "k8s",
      label: "Kubernetes",
      code: [
        "kubectl create secret generic optikk-otlp \\",
        `  --from-literal=api-key=${key}`,
        "",
        "# Full Collector Deployment + ConfigMap manifests:",
        "#   Settings → Instrumentation → OTel Collector on Kubernetes",
      ].join("\n"),
    },
  ];
}
