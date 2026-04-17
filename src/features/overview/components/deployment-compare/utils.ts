import {
  type DeploymentCompareResponse,
  type deploymentsApi,
} from "@/features/overview/api/deploymentsApi";
import { CHART_COLORS } from "@config/constants";
import { formatTimestamp } from "@shared/utils/formatters";

import type { DeploymentSeed, TimelineSeries } from "./types";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : value === "true";
}

function readTimestampMs(value: unknown): number {
  const raw = readString(value);
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Normalises a free-form drawer payload (from a navigation link) into a
 * validated DeploymentSeed. Returns null when the payload is missing any
 * required identity field.
 */
export function parseDeploymentSeed(
  initialData: Record<string, unknown> | null | undefined
): DeploymentSeed | null {
  if (!initialData) return null;
  const serviceName = readString(initialData.service_name);
  const version = readString(initialData.version);
  const environment = readString(initialData.environment);
  const deployedAtMs = readTimestampMs(initialData.deployed_at);
  if (!serviceName || !version || deployedAtMs <= 0) return null;

  const lastSeenRaw = readTimestampMs(initialData.last_seen_at);
  return {
    serviceName,
    version,
    environment,
    deployedAtMs,
    lastSeenAtMs: lastSeenRaw > 0 ? lastSeenRaw : null,
    isActive: readBoolean(initialData.is_active),
  };
}

export function toneFromDelta(delta: number): "positive" | "negative" | "neutral" {
  if (delta > 0) return "negative";
  if (delta < 0) return "positive";
  return "neutral";
}

export function formatWindowLabel(startMs: number, endMs: number): string {
  return `${formatTimestamp(startMs)} to ${formatTimestamp(endMs)}`;
}

export function buildTimelineSeries(
  compare: DeploymentCompareResponse,
  points: Awaited<ReturnType<typeof deploymentsApi.getVersionTraffic>>
): { timestamps: number[]; series: TimelineSeries[] } {
  const uniqueTimestamps = Array.from(
    new Set(points.map((point) => new Date(point.timestamp).getTime()).filter(Number.isFinite))
  ).sort((a, b) => a - b);

  const versionMap = new Map<string, Map<number, number>>();
  for (const point of points) {
    const ts = new Date(point.timestamp).getTime();
    if (!Number.isFinite(ts)) continue;
    if (!versionMap.has(point.version)) versionMap.set(point.version, new Map<number, number>());
    versionMap.get(point.version)?.set(ts, point.rps);
  }

  const versions = Array.from(versionMap.keys()).sort((left, right) => {
    if (left === compare.deployment.version) return -1;
    if (right === compare.deployment.version) return 1;
    return left.localeCompare(right);
  });

  return {
    timestamps: uniqueTimestamps.map((t) => t / 1000),
    series: versions.map((version, index) => ({
      label: version,
      values: uniqueTimestamps.map((t) => versionMap.get(version)?.get(t) ?? null),
      color:
        version === compare.deployment.version
          ? "var(--color-primary)"
          : CHART_COLORS[index % CHART_COLORS.length],
    })),
  };
}
