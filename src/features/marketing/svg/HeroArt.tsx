/**
 * Decorative inline SVG for marketing heroes. Pure stroke + gradient,
 * no raster. Hidden from assistive tech.
 */
export function HeroArt() {
  return (
    <svg
      className="marketing-hero-art"
      viewBox="0 0 480 320"
      aria-hidden="true"
      preserveAspectRatio="xMaxYMid meet"
    >
      <defs>
        <linearGradient id="ha-stroke" x1="0" y1="0" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="480" height="320" fill="url(#ha-glow)" />
      <g stroke="url(#ha-stroke)" strokeWidth="1.2" fill="none" strokeLinecap="round">
        {/* concentric arcs */}
        <circle cx="360" cy="160" r="140" />
        <circle cx="360" cy="160" r="100" />
        <circle cx="360" cy="160" r="60" />
        {/* horizontal timeline */}
        <path d="M40 200 L200 200 L240 160 L440 160" />
        <path d="M40 230 L180 230 L220 260 L440 260" />
        <path d="M40 260 L160 260 L200 230 L440 230" />
        {/* points */}
        <circle cx="200" cy="200" r="3" fill="currentColor" />
        <circle cx="240" cy="160" r="3" fill="currentColor" />
        <circle cx="180" cy="230" r="3" fill="currentColor" />
        <circle cx="220" cy="260" r="3" fill="currentColor" />
        <circle cx="160" cy="260" r="3" fill="currentColor" />
        <circle cx="200" cy="230" r="3" fill="currentColor" />
      </g>
    </svg>
  )
}
