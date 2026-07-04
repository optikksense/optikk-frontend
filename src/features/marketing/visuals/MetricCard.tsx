export function MetricCard({
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
