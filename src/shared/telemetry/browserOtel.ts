import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  type TracerConfig,
} from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

/**
 * Registers browser trace export when Vite env is set. Safe to call multiple times (no-op after first init).
 * Configure via:
 * - VITE_OTEL_ENABLED=true
 * - VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT (full URL to /v1/traces)
 * - VITE_OTEL_SERVICE_NAME (optional, default optikk-frontend)
 * - VITE_OTEL_TRACES_SAMPLE_RATIO (optional, 0–1)
 */
let initialized = false;

export function initBrowserOpenTelemetry(): void {
  if (initialized) {
    return;
  }
  if (import.meta.env.VITE_OTEL_ENABLED !== "true") {
    return;
  }
  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim();
  if (!endpoint) {
    console.warn(
      "[otel] VITE_OTEL_ENABLED is true but VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT is empty; skipping"
    );
    return;
  }

  const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME?.trim() || "optikk-frontend";
  const exporter = new OTLPTraceExporter({ url: endpoint });

  const ratioRaw = import.meta.env.VITE_OTEL_TRACES_SAMPLE_RATIO?.trim();
  let sampler: TracerConfig["sampler"];
  if (ratioRaw !== undefined && ratioRaw !== "") {
    const r = Number(ratioRaw);
    if (!Number.isFinite(r) || r < 0 || r > 1) {
      console.warn("[otel] invalid VITE_OTEL_TRACES_SAMPLE_RATIO; using default sampling");
    } else if (r < 1) {
      sampler = new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(r) });
    }
  }

  const provider = new WebTracerProvider({
    ...(sampler !== undefined ? { sampler } : {}),
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });
  provider.register();
  initialized = true;
}
