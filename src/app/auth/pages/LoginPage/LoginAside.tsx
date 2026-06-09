import { Activity } from "lucide-react";

/**
 * Left-side brand panel for the login page.
 * Shows Optikk branding, pitch headline, a decorative telemetry preview
 * tile, and footer links. Purely presentational — no auth logic.
 */
export function LoginAside() {
  return (
    <aside className="login-aside">
      <div className="aside-grid" />

      {/* Brand mark */}
      <div className="aside-brand">
        <span className="aside-brand-icon">
          <Activity size={16} />
        </span>
        Optikk
      </div>

      {/* Pitch section */}
      <div className="aside-pitch">
        <div className="aside-eyebrow">Observability</div>
        <h1 className="aside-headline">
          See every signal. <em>Resolve before users notice.</em>
        </h1>
        <p className="aside-sub">
          Metrics, traces, logs, and LLM telemetry — unified in one workspace and tied back to the
          services and hosts that produced them.
        </p>

        {/* Telemetry preview tile */}
        <div className="aside-tile">
          <div className="aside-tile-head">
            <span className="aside-tile-title">
              <span className="pulse" />
              Request Latency — P95
            </span>
            <span className="aside-tile-meta">Last 15 min</span>
          </div>

          <SparklineSvg />

          <div className="aside-tile-row">
            <div>
              <div className="aside-stat-label">P95 Latency</div>
              <div className="aside-stat-value">
                142<span className="unit">ms</span>
              </div>
            </div>
            <div>
              <div className="aside-stat-label">Requests/s</div>
              <div className="aside-stat-value">
                2.4<span className="unit">k</span>
              </div>
            </div>
            <div>
              <div className="aside-stat-label">Error Rate</div>
              <div className="aside-stat-value">
                0.12<span className="unit">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="aside-foot">
        <span>© 2026 Optikk, Inc.</span>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Security</a>
      </div>
    </aside>
  );
}

/* ── Decorative sparkline SVG ────────────────────────────── */
function SparklineSvg() {
  return (
    <svg className="aside-spark" viewBox="0 0 400 64" fill="none" aria-hidden="true">
      {/* Area fill */}
      <path
        d="M0 52 C20 48 40 40 60 38 C80 36 100 42 120 36 C140 30 160 24 180 22 C200 20 220 26 240 24 C260 22 280 16 300 18 C320 20 340 14 360 12 C380 10 400 8 400 8 L400 64 L0 64 Z"
        fill="url(#sparkGrad)"
        opacity="0.5"
      />
      {/* Line */}
      <path
        d="M0 52 C20 48 40 40 60 38 C80 36 100 42 120 36 C140 30 160 24 180 22 C200 20 220 26 240 24 C260 22 280 16 300 18 C320 20 340 14 360 12 C380 10 400 8 400 8"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      <circle cx="400" cy="8" r="3" fill="#3b82f6" />
      <circle cx="400" cy="8" r="6" fill="#3b82f6" opacity="0.2" />
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="64">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  );
}
