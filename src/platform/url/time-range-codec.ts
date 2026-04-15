const relativeExpression = /^now-(\d+)(m|h|d)$/

export interface RelativeTimeRange {
  readonly kind: "relative"
  readonly preset: string
  readonly label: string
}

export interface AbsoluteTimeRange {
  readonly kind: "absolute"
  readonly startMs: number
  readonly endMs: number
  readonly label: string
}

export type TimeRange = RelativeTimeRange | AbsoluteTimeRange

export function defaultTimeRange(): TimeRange {
  return { kind: "relative", preset: "15m", label: "Last 15m" }
}

export function parseTimeRange(from: string | null, to: string | null): TimeRange {
  if (!from) {
    return defaultTimeRange()
  }
  if (from.startsWith("now-") && (!to || to === "now")) {
    const match = relativeExpression.exec(from)
    if (!match) {
      return defaultTimeRange()
    }
    return {
      kind: "relative",
      preset: `${match[1]}${match[2]}`,
      label: `Last ${match[1]}${match[2]}`,
    }
  }

  const startMs = Number(from)
  const endMs = Number(to)
  if (Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs) {
    return { kind: "absolute", startMs, endMs, label: "Custom range" }
  }
  return defaultTimeRange()
}

export function serializeTimeRange(range: TimeRange): { from: string; to: string } {
  if (range.kind === "relative") {
    return { from: `now-${range.preset}`, to: "now" }
  }
  return { from: String(range.startMs), to: String(range.endMs) }
}
