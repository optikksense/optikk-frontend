import { formatDuration } from "@shared/utils/formatters";

export function formatSeconds(value: number): string {
  return formatDuration(value * 1000);
}
