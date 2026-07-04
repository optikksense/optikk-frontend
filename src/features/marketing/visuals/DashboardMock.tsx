import { Histogram } from "./Histogram";
import { LogLine } from "./LogLine";
import { Span } from "./Span";
import { MetricCard } from "./MetricCard";

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
