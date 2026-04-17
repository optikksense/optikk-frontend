import type { SVGProps } from "react"

const STROKE = {
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const glyphs = {
  logs: (
    <g {...STROKE}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </g>
  ),
  traces: (
    <g {...STROKE}>
      <path d="M4 6h6l2 4h8" />
      <path d="M4 12h4l2 4h10" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
    </g>
  ),
  metrics: (
    <g {...STROKE}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 15l3-4 3 3 4-7" />
    </g>
  ),
  llm: (
    <g {...STROKE}>
      <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2 8 12.7 4 8.8 9.5 8z" />
    </g>
  ),
  alerts: (
    <g {...STROKE}>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1 2H5z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </g>
  ),
  otel: (
    <g {...STROKE}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M10.5 10.5l3 3" />
    </g>
  ),
  workspace: (
    <g {...STROKE}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </g>
  ),
  bolt: (
    <g {...STROKE}>
      <path d="M13 3 5 14h6l-1 7 8-11h-6z" fill="currentColor" fillOpacity="0.1" />
    </g>
  ),
  shield: (
    <g {...STROKE}>
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </g>
  ),
  clock: (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </g>
  ),
  compass: (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="8" />
      <path d="M15 9l-2 5-4 1 2-5z" fill="currentColor" fillOpacity="0.12" />
    </g>
  ),
  link: (
    <g {...STROKE}>
      <path d="M10 14a4 4 0 0 1 0-5.7l2.3-2.3a4 4 0 0 1 5.7 5.7l-1.3 1.3" />
      <path d="M14 10a4 4 0 0 1 0 5.7l-2.3 2.3a4 4 0 1 1-5.7-5.7l1.3-1.3" />
    </g>
  ),
  grid: (
    <g {...STROKE}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </g>
  ),
  sparkle: (
    <g {...STROKE}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </g>
  ),
  server: (
    <g {...STROKE}>
      <rect x="4" y="4" width="16" height="6" rx="1" />
      <rect x="4" y="14" width="16" height="6" rx="1" />
      <path d="M8 7h.01M8 17h.01" />
    </g>
  ),
  search: (
    <g {...STROKE}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </g>
  ),
} as const

export type GlyphName = keyof typeof glyphs

export function Glyph({
  name,
  size = 20,
  ...rest
}: { readonly name: GlyphName; readonly size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const content = glyphs[name] ?? glyphs.workspace
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {content}
    </svg>
  )
}
