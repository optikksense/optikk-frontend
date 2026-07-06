/**
 * Resolves the OTLP ingest endpoint shown to new users. Prefers an explicit
 * build-time value, else derives it from the current origin (api.* -> ingest.*),
 * falling back to the local ingest port for dev.
 */
export function resolveOtlpEndpoint(): string {
  const fromEnv = import.meta.env.VITE_OTLP_ENDPOINT;
  if (fromEnv != null && fromEnv.length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }
  const { origin } = window.location;
  if (origin.includes("api.")) {
    return origin.replace("api.", "ingest.");
  }
  return "http://localhost:4318";
}
