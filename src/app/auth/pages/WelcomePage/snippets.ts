export interface Snippet {
  readonly id: string;
  readonly label: string;
  readonly code: string;
}

const KEY_PLACEHOLDER = "<YOUR_API_KEY>";

// Builds the collector-config snippets for each deployment target. When the
// key is unavailable (page reload), a placeholder keeps the snippets valid.
export function buildSnippets(endpoint: string, apiKey: string | null): Snippet[] {
  const key = apiKey ?? KEY_PLACEHOLDER;
  return [
    {
      id: "env",
      label: "Env vars",
      code: [
        `export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoint}"`,
        `export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=${key}"`,
      ].join("\n"),
    },
    {
      id: "docker",
      label: "Docker",
      code: [
        "docker run --rm \\",
        `  -e OTEL_EXPORTER_OTLP_ENDPOINT="${endpoint}" \\`,
        `  -e OTEL_EXPORTER_OTLP_HEADERS="x-api-key=${key}" \\`,
        "  otel/opentelemetry-collector:latest",
      ].join("\n"),
    },
    {
      id: "k8s",
      label: "Kubernetes",
      code: [
        "kubectl create secret generic optikk-otlp \\",
        `  --from-literal=api-key=${key}`,
        "",
        "# Point your collector's OTLP exporter at:",
        `#   ${endpoint}`,
        "# with header  x-api-key  from the secret above.",
      ].join("\n"),
    },
  ];
}
