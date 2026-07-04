export function Span({
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
