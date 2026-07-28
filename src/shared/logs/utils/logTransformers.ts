import type { DrawerAttrGroup } from "@shared/components/ui/overlay/detail-drawer/DrawerAttrTable";
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
      ["service.name", log.serviceName, "var(--accent-2)"],
      ...(log.environment ? ([["env", log.environment]] as const) : []),
      ...(log.scopeName ? ([["scope.name", log.scopeName]] as const) : []),
      ...(log.scopeVersion ? ([["scope.version", log.scopeVersion]] as const) : []),
    ],
  };

  const severity: DrawerAttrGroup = {
    label: "Severity",
    rows: [
      ["severityText", log.severityText ?? sevLabel, sevColor],
      ["severityBucket", String(log.severityBucket)],
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
    ...Object.entries(log.attributesString ?? {}),
    ...Object.entries(log.attributesNumber ?? {}).map(
      ([k, v]) => [k, String(v)] as [string, string]
    ),
    ...Object.entries(log.attributesBool ?? {}).map(
      ([k, v]) => [k, v ? "true" : "false"] as [string, string]
    ),
  ].sort(([a], [b]) => a.localeCompare(b));

  const attributes: DrawerAttrGroup = { label: "Attributes", rows: dynamic };

  return [source, severity, infra, trace, attributes].filter((g) => g.rows.length > 0);
}
