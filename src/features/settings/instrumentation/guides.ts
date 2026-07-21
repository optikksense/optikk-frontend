/**
 * Static, per-language OpenTelemetry instrumentation guides rendered by the
 * Instrumentation settings tab. Content is data-driven so a new language is a
 * single entry here — the tab component stays presentational.
 *
 * The API key is never a live value on this page (keys are hashed and shown
 * once, at creation). Snippets use a placeholder and link users to
 * Settings -> Tenant to mint one.
 */

export const API_KEY_PLACEHOLDER = "<YOUR_API_KEY>";

export interface GuideStep {
  readonly title: string;
  /** Optional prose shown above the code block. */
  readonly description?: string;
  readonly code: string;
}

export interface LanguageGuide {
  readonly id: "java" | "go" | "python";
  readonly label: string;
  /** One-line framing of the recommended approach for this language. */
  readonly summary: string;
  readonly steps: readonly GuideStep[];
}

/**
 * Builds the guides for the given ingest endpoint. Endpoint is injected so the
 * snippets show the user's real OTLP target rather than a placeholder.
 */
export function buildLanguageGuides(endpoint: string): readonly LanguageGuide[] {
  const key = API_KEY_PLACEHOLDER;

  return [
    {
      id: "java",
      label: "Java",
      summary:
        "Zero-code: attach the OpenTelemetry Java agent — no code changes, works with any Spring Boot / JVM service.",
      steps: [
        {
          title: "Download the agent",
          description: "Fetch the latest OpenTelemetry Java agent jar.",
          code: [
            "curl -L -o opentelemetry-javaagent.jar \\",
            "  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar",
          ].join("\n"),
        },
        {
          title: "Run your service with the agent",
          description:
            "No dependency changes. The agent auto-instruments HTTP, JDBC, Kafka and more.",
          code: [
            `export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoint}"`,
            `export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=${key}"`,
            'export OTEL_SERVICE_NAME="my-service"',
            "",
            "java -javaagent:./opentelemetry-javaagent.jar -jar my-service.jar",
          ].join("\n"),
        },
        {
          title: "Alternative: Spring Boot starter",
          description: "Prefer a dependency over an agent jar? Add the starter to your build.",
          code: [
            "// build.gradle",
            'implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")',
          ].join("\n"),
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      summary:
        "No auto-agent for Go — add the SDK plus the OTLP/HTTP exporter and wire it at startup.",
      steps: [
        {
          title: "Add the dependencies",
          code: [
            "go get go.opentelemetry.io/otel \\",
            "  go.opentelemetry.io/otel/sdk \\",
            "  go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp \\",
            "  go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp",
          ].join("\n"),
        },
        {
          title: "Initialise the tracer",
          description: "Call this once at startup; defer the returned shutdown.",
          code: [
            "import (",
            '  "context"',
            '  "go.opentelemetry.io/otel"',
            '  "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"',
            '  "go.opentelemetry.io/otel/sdk/trace"',
            ")",
            "",
            "func initTracer(ctx context.Context) (*trace.TracerProvider, error) {",
            "  exp, err := otlptracehttp.New(ctx) // reads OTEL_EXPORTER_OTLP_* env",
            "  if err != nil {",
            "    return nil, err",
            "  }",
            "  tp := trace.NewTracerProvider(trace.WithBatcher(exp))",
            "  otel.SetTracerProvider(tp)",
            "  return tp, nil",
            "}",
          ].join("\n"),
        },
        {
          title: "Point it at Optikk",
          code: [
            `export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoint}"`,
            `export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=${key}"`,
            'export OTEL_SERVICE_NAME="my-service"',
          ].join("\n"),
        },
      ],
    },
    {
      id: "python",
      label: "Python",
      summary:
        "Zero-code: install the distro, let bootstrap add instrumentation, then launch via opentelemetry-instrument.",
      steps: [
        {
          title: "Install and bootstrap",
          description: "Bootstrap detects your libraries and installs matching instrumentation.",
          code: [
            "pip install opentelemetry-distro opentelemetry-exporter-otlp",
            "opentelemetry-bootstrap -a install",
          ].join("\n"),
        },
        {
          title: "Run your app instrumented",
          code: [
            `export OTEL_EXPORTER_OTLP_ENDPOINT="${endpoint}"`,
            `export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=${key}"`,
            'export OTEL_SERVICE_NAME="my-service"',
            "",
            "opentelemetry-instrument python app.py",
          ].join("\n"),
        },
      ],
    },
  ];
}

/**
 * Kubernetes path: run a shared OpenTelemetry Collector that fans your services'
 * telemetry out to Optikk. Services export to the in-cluster collector; the
 * collector holds the API key and exports to Optikk. Two Optikk-specific
 * gotchas are baked in: OTLP is served on :4317/:4318 (not 443), and the
 * OTLP/HTTP receiver rejects gzip — so the exporter disables compression.
 */
export interface CollectorSnippet {
  readonly title: string;
  readonly description?: string;
  readonly code: string;
}

export function buildCollectorSnippets(endpoint: string): readonly CollectorSnippet[] {
  return [
    {
      title: "1. Store the API key as a Secret",
      code: [
        "kubectl create secret generic optikk-otlp \\",
        "  --namespace observability \\",
        `  --from-literal=api-key=${API_KEY_PLACEHOLDER}`,
      ].join("\n"),
    },
    {
      title: "2. Collector config (ConfigMap)",
      description:
        "compression: none is required — Optikk's OTLP/HTTP endpoint rejects gzip-encoded bodies.",
      code: [
        "apiVersion: v1",
        "kind: ConfigMap",
        "metadata:",
        "  name: otel-collector-config",
        "  namespace: observability",
        "data:",
        "  config.yaml: |",
        "    receivers:",
        "      otlp:",
        "        protocols:",
        "          grpc: { endpoint: 0.0.0.0:4317 }",
        "          http: { endpoint: 0.0.0.0:4318 }",
        "    processors:",
        "      batch: {}",
        "    exporters:",
        "      otlphttp/optikk:",
        `        endpoint: ${endpoint}`,
        "        compression: none",
        "        headers:",
        "          x-api-key: ${OPTIKK_API_KEY}",
        "    service:",
        "      pipelines:",
        "        traces:  { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
        "        metrics: { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
        "        logs:    { receivers: [otlp], processors: [batch], exporters: [otlphttp/optikk] }",
      ].join("\n"),
    },
    {
      title: "3. Deploy the collector",
      description: "The API key is injected from the Secret into OPTIKK_API_KEY.",
      code: [
        "apiVersion: apps/v1",
        "kind: Deployment",
        "metadata:",
        "  name: otel-collector",
        "  namespace: observability",
        "spec:",
        "  replicas: 1",
        "  selector: { matchLabels: { app: otel-collector } }",
        "  template:",
        "    metadata: { labels: { app: otel-collector } }",
        "    spec:",
        "      containers:",
        "        - name: otel-collector",
        "          image: otel/opentelemetry-collector-contrib:latest",
        '          args: ["--config=/etc/otel/config.yaml"]',
        "          env:",
        "            - name: OPTIKK_API_KEY",
        "              valueFrom:",
        "                secretKeyRef: { name: optikk-otlp, key: api-key }",
        "          volumeMounts:",
        "            - { name: config, mountPath: /etc/otel }",
        "      volumes:",
        "        - name: config",
        "          configMap: { name: otel-collector-config }",
      ].join("\n"),
    },
    {
      title: "4. Point your services at the collector",
      description:
        "Your apps export to the in-cluster collector Service instead of directly to Optikk.",
      code: ['OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector.observability:4318"'].join("\n"),
    },
  ];
}
