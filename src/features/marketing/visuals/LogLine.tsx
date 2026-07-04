export function LogLine({
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
