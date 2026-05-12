/**
 * Animated network graph SVG for marketing heroes.
 * Glowing nodes + pulsing connection lines representing
 * logs, traces, and metrics flowing through the system.
 */
export function HeroArt() {
  return (
    <svg
      className="marketing-hero-art"
      viewBox="0 0 480 380"
      aria-hidden="true"
      preserveAspectRatio="xMaxYMid meet"
    >
      <defs>
        <linearGradient id="ha-line" x1="0" y1="0" x2="480" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#8b8eff" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ha-node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#5ea9ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#5ea9ff" stopOpacity="0" />
        </radialGradient>
        <filter id="ha-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse cx="280" cy="190" rx="200" ry="160" fill="url(#ha-glow)" />

      {/* Connection lines */}
      <g stroke="url(#ha-line)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6">
        {/* Central hub connections */}
        <path d="M280 190 L140 100" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M280 190 L420 120" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M280 190 L380 300" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="3.5s" repeatCount="indefinite" />
        </path>
        <path d="M280 190 L120 260" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.8s" repeatCount="indefinite" />
        </path>
        <path d="M280 190 L200 310" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="3.2s" repeatCount="indefinite" />
        </path>
        <path d="M280 190 L440 220" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.6s" repeatCount="indefinite" />
        </path>
        {/* Outer connections */}
        <path d="M140 100 L80 60" strokeDasharray="3 5">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M420 120 L460 60" strokeDasharray="3 5">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="3.8s" repeatCount="indefinite" />
        </path>
        <path d="M120 260 L60 300" strokeDasharray="3 5">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="4.2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Concentric rings around central hub */}
      <circle cx="280" cy="190" r="24" stroke="#3b82f6" strokeWidth="0.5" fill="none" opacity="0.2">
        <animate attributeName="r" values="24;28;24" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.1;0.2" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="280" cy="190" r="40" stroke="#5e60ce" strokeWidth="0.4" fill="none" opacity="0.12">
        <animate attributeName="r" values="40;46;40" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.06;0.12" dur="5s" repeatCount="indefinite" />
      </circle>

      {/* Node glows */}
      <g filter="url(#ha-blur)">
        <circle cx="280" cy="190" r="10" fill="#3b82f6" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="100" r="6" fill="#5ea9ff" opacity="0.25" />
        <circle cx="420" cy="120" r="6" fill="#8b8eff" opacity="0.25" />
        <circle cx="380" cy="300" r="6" fill="#34d399" opacity="0.25" />
        <circle cx="120" cy="260" r="6" fill="#f38b6b" opacity="0.25" />
      </g>

      {/* Nodes */}
      <g>
        {/* Central hub - Optikk */}
        <circle cx="280" cy="190" r="6" fill="#3b82f6">
          <animate attributeName="r" values="6;7;6" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Signal nodes */}
        <circle cx="140" cy="100" r="4" fill="#5ea9ff" />
        <circle cx="420" cy="120" r="4" fill="#8b8eff" />
        <circle cx="380" cy="300" r="3.5" fill="#34d399" />
        <circle cx="120" cy="260" r="3.5" fill="#f38b6b" />
        <circle cx="200" cy="310" r="3" fill="#facc15" />
        <circle cx="440" cy="220" r="3" fill="#c084fc" />
        {/* Leaf nodes */}
        <circle cx="80" cy="60" r="2.5" fill="#5ea9ff" opacity="0.6" />
        <circle cx="460" cy="60" r="2.5" fill="#8b8eff" opacity="0.6" />
        <circle cx="60" cy="300" r="2.5" fill="#f38b6b" opacity="0.6" />
      </g>

      {/* Labels */}
      <g fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500" fill="currentColor" opacity="0.5">
        <text x="140" y="85" textAnchor="middle">Logs</text>
        <text x="420" y="105" textAnchor="middle">Traces</text>
        <text x="380" y="320" textAnchor="middle">Metrics</text>
        <text x="120" y="250" textAnchor="end">Hosts</text>
        <text x="200" y="332" textAnchor="middle">Kafka</text>
        <text x="446" y="212" textAnchor="start">DB</text>
      </g>
    </svg>
  )
}
