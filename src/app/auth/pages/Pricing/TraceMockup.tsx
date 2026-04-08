import { motion } from "framer-motion";

interface TraceRow {
  service: string;
  duration: number;
  maxDuration: number;
  status: number;
  color: string;
  spans: number;
}

const TRACES: TraceRow[] = [
  {
    service: "api-gateway",
    duration: 312,
    maxDuration: 312,
    status: 200,
    color: "#6366F1",
    spans: 8,
  },
  {
    service: "auth-service",
    duration: 187,
    maxDuration: 312,
    status: 200,
    color: "#22D3EE",
    spans: 3,
  },
  {
    service: "payment-svc",
    duration: 241,
    maxDuration: 312,
    status: 200,
    color: "#10B981",
    spans: 5,
  },
  {
    service: "postgres-proxy",
    duration: 98,
    maxDuration: 312,
    status: 200,
    color: "#8B5CF6",
    spans: 2,
  },
  {
    service: "redis-cache",
    duration: 14,
    maxDuration: 312,
    status: 200,
    color: "#F59E0B",
    spans: 1,
  },
  {
    service: "notification",
    duration: 156,
    maxDuration: 312,
    status: 500,
    color: "#EF4444",
    spans: 4,
  },
  {
    service: "billing-worker",
    duration: 203,
    maxDuration: 312,
    status: 200,
    color: "#06B6D4",
    spans: 6,
  },
  { service: "event-bus", duration: 67, maxDuration: 312, status: 200, color: "#EC4899", spans: 2 },
];

export default function TraceMockup() {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "#0D0E14",
        boxShadow: "0 32px 80px -20px rgba(0,0,0,0.7)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "#161720",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          className="font-mono"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 6,
            padding: "3px 12px",
            fontSize: 10,
            color: "#475569",
          }}
        >
          app.optikk.io/traces
        </div>
      </div>

      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr 60px 52px",
          padding: "8px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 10,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
        className="font-mono"
      >
        <span>Service</span>
        <span>Duration Span</span>
        <span style={{ textAlign: "right" }}>ms</span>
        <span style={{ textAlign: "center" }}>Status</span>
      </div>

      {/* Trace rows */}
      {TRACES.map((row, i) => (
        <motion.div
          key={row.service}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr 60px 52px",
            alignItems: "center",
            padding: "7px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: "#94A3B8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.service}
          </span>
          <div style={{ paddingRight: 12 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(row.duration / row.maxDuration) * 100}%` }}
              transition={{ delay: i * 0.06 + 0.1, duration: 0.5, ease: "easeOut" }}
              style={{
                height: 12,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${row.color}cc, ${row.color}66)`,
                minWidth: 4,
              }}
            />
          </div>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "#64748B", textAlign: "right" }}
          >
            {row.duration}ms
          </span>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: row.status === 200 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: row.status === 200 ? "#10B981" : "#EF4444",
                border: `1px solid ${row.status === 200 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              {row.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
