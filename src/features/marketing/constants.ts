export const OSS = {
  org: "https://github.com/optikksense",
  frontend: "https://github.com/optikksense/optikk-frontend",
  backend: "https://github.com/optikksense/optikk-backend",
  scheduler: "https://github.com/optikksense/scheduler",
  otelJava: "https://github.com/optikksense/opentelemetry-java",
  otelDemo: "https://github.com/optikksense/opentelemetry-demo",
  license: "Apache 2.0",
} as const;

export function formatStars(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, "")}k`;
  }
  return n.toString();
}
