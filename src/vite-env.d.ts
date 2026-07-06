/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTEL_ENABLED?: string;
  /** Full OTLP/HTTP traces URL (e.g. https://collector.example.com/v1/traces). Required when VITE_OTEL_ENABLED is true. */
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string;
  readonly VITE_OTEL_SERVICE_NAME?: string;

  readonly VITE_OTEL_TRACES_SAMPLE_RATIO?: string;

  /** Customer-facing OTLP ingest endpoint shown on the Welcome page. */
  readonly VITE_OTLP_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
