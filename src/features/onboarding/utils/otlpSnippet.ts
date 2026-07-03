// Resolves the OTLP ingest endpoint for the copy-paste snippet. Prefers the
// build-time VITE_OTLP_ENDPOINT; otherwise derives it from the current origin
// (api.* -> ingest.*), mirroring the CLI's otlpEndpoint() convention.
export function resolveOtlpEndpoint(): string {
  const fromEnv = import.meta.env.VITE_OTLP_ENDPOINT as string | undefined;
  if (fromEnv != null && fromEnv !== "") return fromEnv.replace(/\/+$/, "");

  const { host, protocol, origin } = window.location;
  if (host.startsWith("api.")) return `${protocol}//${host.replace(/^api\./, "ingest.")}`;
  return origin;
}

export type SnippetTarget = "env" | "docker" | "kubernetes";

export const SNIPPET_TARGETS: readonly { readonly id: SnippetTarget; readonly label: string }[] = [
  { id: "env", label: "Env vars" },
  { id: "docker", label: "Docker" },
  { id: "kubernetes", label: "Kubernetes" },
];

// Builds the OTLP config snippet for a given deployment target. The two values
// are always the same; only the surrounding syntax differs.
export function buildSnippet(target: SnippetTarget, endpoint: string, apiKey: string): string {
  const headers = `x-api-key=${apiKey}`;
  switch (target) {
    case "docker":
      return [
        "environment:",
        `  OTEL_EXPORTER_OTLP_ENDPOINT: ${endpoint}`,
        `  OTEL_EXPORTER_OTLP_HEADERS: ${headers}`,
      ].join("\n");
    case "kubernetes":
      return [
        "env:",
        "  - name: OTEL_EXPORTER_OTLP_ENDPOINT",
        `    value: ${endpoint}`,
        "  - name: OTEL_EXPORTER_OTLP_HEADERS",
        `    value: ${headers}`,
      ].join("\n");
    default:
      return [
        `OTEL_EXPORTER_OTLP_ENDPOINT=${endpoint}`,
        `OTEL_EXPORTER_OTLP_HEADERS=${headers}`,
      ].join("\n");
  }
}
