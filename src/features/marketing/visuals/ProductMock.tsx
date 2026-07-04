import { Activity, BarChart3, Box, Workflow } from "lucide-react";

interface ProductMockProps {
  readonly title?: string;
}

export function ProductMock({ title = "optikk.dev / service-graph" }: ProductMockProps) {
  return (
    <div className="m-hero-art-window">
      <div className="m-hero-art-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <div className="m-hero-art-body">
        <div className="m-hero-art-side">
          <b>Optikk</b>
          <a className="is-active" href="#">
            <span /> Overview
          </a>
          <a href="#">
            <span style={{ background: "#60a5fa" }} /> Services
          </a>
          <a href="#">
            <span style={{ background: "#f97316" }} /> Logs
          </a>
          <a href="#">
            <span style={{ background: "#a78bfa" }} /> Traces
          </a>
          <a href="#">
            <span style={{ background: "#34d399" }} /> Metrics
          </a>
          <a href="#">
            <span style={{ background: "#f43f5e" }} /> Alerts
          </a>
          <a href="#">
            <span style={{ background: "#fbbf24" }} /> Infra
          </a>
        </div>
        <div className="m-hero-art-main">
          <div className="m-hero-art-search">
            <span style={{ color: "#60a5fa" }}>service</span>
            <span>=</span>
            <span style={{ color: "#4ade80" }}>"checkout"</span>
            <span>AND</span>
            <span style={{ color: "#60a5fa" }}>status</span>
            <span>=</span>
            <span style={{ color: "#f87171" }}>"error"</span>
          </div>
          <div className="m-hero-art-grid">
            <div className="m-hero-tile" style={{ gridRow: "span 2" }}>
              <div className="m-hero-tile-head">
                <span>
                  <Activity
                    size={11}
                    style={{ display: "inline", marginRight: 4, verticalAlign: -1 }}
                  />
                  Request rate
                </span>
                <span>last 15m</span>
              </div>
              <div className="m-hero-tile-value">128.4k rps</div>
              <svg
                aria-hidden="true"
                viewBox="0 0 320 64"
                className="m-hero-spark"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="m-spark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 44 L20 38 L40 42 L60 30 L80 34 L100 20 L120 26 L140 14 L160 22 L180 10 L200 18 L220 6 L240 12 L260 4 L280 10 L300 16 L320 8"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                />
                <path
                  d="M0 44 L20 38 L40 42 L60 30 L80 34 L100 20 L120 26 L140 14 L160 22 L180 10 L200 18 L220 6 L240 12 L260 4 L280 10 L300 16 L320 8 L320 64 L0 64 Z"
                  fill="url(#m-spark-grad)"
                />
              </svg>
              <div className="m-hero-tile-head">
                <span>
                  <BarChart3
                    size={11}
                    style={{ display: "inline", marginRight: 4, verticalAlign: -1 }}
                  />
                  Top errors
                </span>
                <span>last 1h</span>
              </div>
              <div className="m-hero-tile-stack">
                <div className="m-hero-bar">
                  <span>checkout</span>
                  <span className="m-hero-bar-track">
                    <span className="m-hero-bar-fill" style={{ width: "86%" }} />
                  </span>
                  <span>418</span>
                </div>
                <div className="m-hero-bar">
                  <span>payments</span>
                  <span className="m-hero-bar-track">
                    <span className="m-hero-bar-fill" style={{ width: "62%" }} />
                  </span>
                  <span>302</span>
                </div>
                <div className="m-hero-bar">
                  <span>cart</span>
                  <span className="m-hero-bar-track">
                    <span className="m-hero-bar-fill" style={{ width: "44%" }} />
                  </span>
                  <span>217</span>
                </div>
                <div className="m-hero-bar">
                  <span>auth</span>
                  <span className="m-hero-bar-track">
                    <span className="m-hero-bar-fill" style={{ width: "28%" }} />
                  </span>
                  <span>136</span>
                </div>
              </div>
            </div>
            <div className="m-hero-tile">
              <div className="m-hero-tile-head">
                <span>
                  <Workflow
                    size={11}
                    style={{ display: "inline", marginRight: 4, verticalAlign: -1 }}
                  />
                  AI summary
                </span>
                <span>auto</span>
              </div>
              <div className="m-hero-tile-rows">
                <div className="m-hero-tile-row">
                  <b>cause</b>
                  <span>db pool exhausted on checkout-api</span>
                </div>
                <div className="is-warn m-hero-tile-row">
                  <b>since</b>
                  <span>14:02 UTC after deploy abc12d</span>
                </div>
                <div className="is-err m-hero-tile-row">
                  <b>impact</b>
                  <span>p99 latency 2.1s, 3.2% 5xx</span>
                </div>
                <div className="m-hero-tile-row">
                  <b>fix</b>
                  <span>roll back, raise pool to 64</span>
                </div>
              </div>
            </div>
            <div className="m-hero-tile">
              <div className="m-hero-tile-head">
                <span>
                  <Box size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                  Live logs
                </span>
                <span>tail · 2.3k/s</span>
              </div>
              <div className="m-hero-tile-rows">
                <div className="m-hero-tile-row">
                  <b style={{ color: "#34d399" }}>INFO</b>
                  <span>checkout.complete order_id=89a4</span>
                </div>
                <div className="is-warn m-hero-tile-row">
                  <b>WARN</b>
                  <span>retry: payment-gateway timeout</span>
                </div>
                <div className="is-err m-hero-tile-row">
                  <b>ERR</b>
                  <span>db pool exhausted (32/32)</span>
                </div>
                <div className="m-hero-tile-row">
                  <b style={{ color: "#34d399" }}>INFO</b>
                  <span>auth.token issued sub=u_12af</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

