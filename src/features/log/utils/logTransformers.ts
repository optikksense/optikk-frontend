import type { DrawerAttrGroup } from "@shared/components/ui/overlay/detail-drawer";
import type { LogRecord } from "../types/log";
import { getSpanId, getTraceId } from "./traceCorrelation";

export function buildAttrGroups(
  log: LogRecord,
  sevLabel: string,
  sevColor: string
): DrawerAttrGroup[] {
  const traceId = getTraceId(log);
  const spanId = getSpanId(log);

  const source: DrawerAttrGroup = {
    label: "Source",
    rows: [
      ["service.name", log.service_name, "var(--accent-2)"],
      ...(log.environment ? ([["env", log.environment]] as const) : []),
      ...(log.scope_name ? ([["scope.name", log.scope_name]] as const) : []),
      ...(log.scope_version ? ([["scope.version", log.scope_version]] as const) : []),
    ],
  };

  const severity: DrawerAttrGroup = {
    label: "Severity",
    rows: [
      ["severity_text", log.severity_text ?? sevLabel, sevColor],
      ["severity_bucket", String(log.severity_bucket)],
    ],
  };

  const infra: DrawerAttrGroup = {
    label: "Infrastructure",
    rows: [
      ...(log.host ? ([["host", log.host]] as const) : []),
      ...(log.pod ? ([["pod", log.pod]] as const) : []),
      ...(log.container ? ([["container", log.container]] as const) : []),
    ],
  };

  const trace: DrawerAttrGroup = {
    label: "Trace",
    rows: traceId
      ? [
          ["trace.id", traceId, "var(--accent-2)"],
          ...(spanId ? ([["span.id", spanId]] as const) : []),
        ]
      : [["has_trace", "false", "var(--fg-3)"]],
  };

  const dynamic: [string, string][] = [
    ...Object.entries(log.attributes_string ?? {}),
    ...Object.entries(log.attributes_number ?? {}).map(
      ([k, v]) => [k, String(v)] as [string, string]
    ),
    ...Object.entries(log.attributes_bool ?? {}).map(
      ([k, v]) => [k, v ? "true" : "false"] as [string, string]
    ),
  ].sort(([a], [b]) => a.localeCompare(b));

  const attributes: DrawerAttrGroup = { label: "Attributes", rows: dynamic };

  return [source, severity, infra, trace, attributes].filter((g) => g.rows.length > 0);
}

export type SeverityLevel = "info" | "warn" | "error";

export function getSeverityTheme(text?: string | null): { level: SeverityLevel; color: string } {
  if (!text) return { level: "info", color: "var(--accent)" };
  const t = text.toUpperCase();
  if (t.startsWith("ERROR") || t.startsWith("FATAL") || t === "ERR") {
    return { level: "error", color: "var(--err)" };
  }
  if (t.startsWith("WARN")) {
    return { level: "warn", color: "var(--warn)" };
  }
  return { level: "info", color: "var(--accent)" };
}

