/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTEL_ENABLED?: string;
  /** Full OTLP/HTTP traces URL (e.g. https://collector.example.com/v1/traces). Required when VITE_OTEL_ENABLED is true. */
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string;
  readonly VITE_OTEL_SERVICE_NAME?: string;
  /** Optional sampling ratio 0–1 for TraceID ratio sampler (default 1). */
  readonly VITE_OTEL_TRACES_SAMPLE_RATIO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
