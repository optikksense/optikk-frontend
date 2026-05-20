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

interface DashboardMockProps {
  readonly title?: string;
  readonly type?: "logs" | "traces" | "metrics";
}

export function DashboardMock({ title, type = "logs" }: DashboardMockProps) {
  if (type === "logs") {
    return (
      <div style={{ background: "#0a1424", color: "#e8eef7", padding: 0 }}>
        <div className="m-hero-art-bar">
          <i />
          <i />
          <i />
          <span>{title ?? "optikk.dev / logs"}</span>
        </div>
        <div style={{ padding: 18, fontFamily: "var(--m-font-mono)", fontSize: 12 }}>
          <div
            style={{
              color: "#8895a8",
              marginBottom: 12,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>
              <span style={{ color: "#60a5fa" }}>level</span>:error{" "}
              <span style={{ color: "#60a5fa" }}>service</span>:checkout
            </span>
            <span style={{ color: "#34d399" }}>·</span>
            <span>2,381 matches</span>
            <span style={{ color: "#34d399" }}>·</span>
            <span>last 5m</span>
          </div>
          <Histogram />
          <div style={{ display: "grid", gap: 6, marginTop: 14, color: "#c0cee0" }}>
            <LogLine
              ts="14:02:13.412"
              level="ERR"
              svc="checkout-api"
              msg="db pool exhausted (32/32)"
            />
            <LogLine
              ts="14:02:13.487"
              level="ERR"
              svc="checkout-api"
              msg="connection refused: postgres:5432"
            />
            <LogLine
              ts="14:02:13.512"
              level="WARN"
              svc="payments"
              msg="retry attempt 3 of 5 — gateway timeout"
            />
            <LogLine ts="14:02:13.601" level="INFO" svc="auth" msg="token issued sub=u_12af" />
            <LogLine
              ts="14:02:13.692"
              level="ERR"
              svc="checkout-api"
              msg="rolling back txn 8af14b — pool wait timeout"
            />
            <LogLine
              ts="14:02:13.748"
              level="INFO"
              svc="cart"
              msg="cart.add user=u_4a7c item=sku_223"
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "traces") {
    return (
      <div style={{ background: "#0a1424", color: "#e8eef7" }}>
        <div className="m-hero-art-bar">
          <i />
          <i />
          <i />
          <span>{title ?? "optikk.dev / traces / 4af09c..."}</span>
        </div>
        <div style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontFamily: "var(--m-font-mono)",
              fontSize: 11,
              color: "#8895a8",
              marginBottom: 18,
            }}
          >
            <span>trace_id=4af09c2b</span>
            <span>·</span>
            <span style={{ color: "#34d399" }}>4 services</span>
            <span>·</span>
            <span style={{ color: "#f97316" }}>1.84s total</span>
          </div>
          <Span name="POST /checkout" service="edge" width={100} offset={0} color="#60a5fa" />
          <Span
            name="checkout.create"
            service="checkout-api"
            width={92}
            offset={4}
            color="#0d9488"
          />
          <Span name="db.query users" service="postgres" width={18} offset={10} color="#a78bfa" />
          <Span
            name="db.query orders"
            service="postgres"
            width={68}
            offset={28}
            color="#f97316"
            warn
          />
          <Span name="payments.charge" service="payments" width={42} offset={40} color="#f87171" />
          <Span name="stripe.api" service="external" width={28} offset={50} color="#d8b4fe" />
          <Span name="kafka.publish" service="events" width={12} offset={82} color="#fbbf24" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a1424", color: "#e8eef7" }}>
      <div className="m-hero-art-bar">
        <i />
        <i />
        <i />
        <span>{title ?? "optikk.dev / metrics"}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          padding: 18,
        }}
      >
        <MetricCard label="checkout.requests" value="128.4k" delta="+12%" color="#0d9488" />
        <MetricCard label="checkout.p99" value="218ms" delta="-8%" color="#34d399" />
        <MetricCard label="payments.errors" value="0.42%" delta="+0.1%" color="#f97316" warn />
        <MetricCard label="db.pool.saturation" value="98%" delta="critical" color="#f87171" err />
      </div>
    </div>
  );
}

function Histogram() {
  const bars = [
    14, 18, 22, 28, 26, 32, 38, 44, 52, 60, 72, 84, 96, 88, 76, 62, 54, 48, 42, 36, 30, 26, 22, 18,
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 64,
        marginBottom: 6,
      }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            flex: 1,
            height: `${h}%`,
            background: i > 10 && i < 16 ? "#f87171" : "#0d9488",
            opacity: i > 10 && i < 16 ? 1 : 0.7,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

function LogLine({
  ts,
  level,
  svc,
  msg,
}: {
  readonly ts: string;
  readonly level: "INFO" | "WARN" | "ERR";
  readonly svc: string;
  readonly msg: string;
}) {
  const levelColor = level === "ERR" ? "#f87171" : level === "WARN" ? "#fbbf24" : "#34d399";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "98px 46px 110px 1fr",
        gap: 10,
        fontFamily: "var(--m-font-mono)",
        fontSize: 11.5,
      }}
    >
      <span style={{ color: "#6b7c95" }}>{ts}</span>
      <span style={{ color: levelColor, fontWeight: 700 }}>{level}</span>
      <span style={{ color: "#60a5fa" }}>{svc}</span>
      <span>{msg}</span>
    </div>
  );
}

function Span({
  name,
  service,
  width,
  offset,
  color,
  warn,
}: {
  readonly name: string;
  readonly service: string;
  readonly width: number;
  readonly offset: number;
  readonly color: string;
  readonly warn?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, marginBottom: 8 }}>
      <div style={{ fontFamily: "var(--m-font-mono)", fontSize: 11.5 }}>
        <div style={{ color: "#fff" }}>{name}</div>
        <div style={{ color: "#8895a8", fontSize: 10.5 }}>{service}</div>
      </div>
      <div
        style={{
          position: "relative",
          height: 22,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${offset}%`,
            width: `${width}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            opacity: warn ? 0.95 : 0.85,
            boxShadow: warn ? "inset 0 0 0 1px rgba(248, 113, 113, 0.4)" : "none",
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  color,
  warn,
  err,
}: {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly color: string;
  readonly warn?: boolean;
  readonly err?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 16,
        background: "rgba(255,255,255,0.02)",
        display: "grid",
        gap: 8,
      }}
    >
      <div
        style={{
          color: "#8895a8",
          fontFamily: "var(--m-font-mono)",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: err ? "#f87171" : warn ? "#fbbf24" : color,
          fontFamily: "var(--m-font-mono)",
        }}
      >
        {delta}
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        style={{ height: 32, marginTop: 4 }}
      >
        <path
          d="M0 30 L20 28 L40 25 L60 22 L80 18 L100 24 L120 14 L140 20 L160 10 L180 16 L200 8"
          fill="none"
          stroke={color}
          strokeWidth={1.4}
        />
      </svg>
    </div>
  );
}
