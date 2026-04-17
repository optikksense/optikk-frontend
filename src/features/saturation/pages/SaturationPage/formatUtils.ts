import { formatBytes, formatDuration } from "@shared/utils/formatters";

export function formatBytesPerSecond(value: number): string {
  return `${formatBytes(value)}/s`;
}

export function formatSeconds(value: number): string {
  return formatDuration(value * 1000);
}
