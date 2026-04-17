import type { SVGProps } from "react"

const STROKE = { strokeWidth: 1.5, stroke: "currentColor", fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

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
