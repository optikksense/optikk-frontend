import { DEMO_LOG_ROWS, type DemoLogRow } from "./fixtures";

interface DemoLogsListProps {
  readonly limit?: number;
}

const LEVEL_TONE: Record<DemoLogRow["level"], string> = {
  INFO: "#6BB6FF",
  WARN: "#F2C14E",
  ERROR: "#F04438",
  DEBUG: "#8CD6C5",
};

function formatTs(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function DemoLogsList({ limit }: DemoLogsListProps) {
  const rows = limit ? DEMO_LOG_ROWS.slice(0, limit) : DEMO_LOG_ROWS;
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] font-mono text-[12px]">
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid items-start gap-3 border-[var(--border-color)] border-b px-3 py-1.5 last:border-b-0"
          style={{ gridTemplateColumns: "72px 64px 120px 1fr" }}
        >
          <span className="text-[var(--text-muted)]">{formatTs(row.tsMs)}</span>
          <span
            className="font-semibold"
            style={{ color: LEVEL_TONE[row.level] }}
          >
            {row.level}
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-secondary)]">
            {row.service}
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-primary)]">
            {row.message}
          </span>
        </div>
      ))}
    </div>
  );
}
