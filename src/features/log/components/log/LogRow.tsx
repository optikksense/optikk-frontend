import "./LogRow.css";

const LEVEL_CLASS: Record<string, string> = {
  FATAL: "log-level--fatal",
  ERROR: "log-level--error",
  WARN: "log-level--warn",
  WARNING: "log-level--warn",
  INFO: "log-level--info",
  DEBUG: "log-level--debug",
  TRACE: "log-level--trace",
};

interface LevelBadgeProps {
  level?: unknown;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelLabel = typeof level === "string" ? level : String(level ?? "INFO");
  const l = levelLabel.toUpperCase();
  const cls = LEVEL_CLASS[l] || LEVEL_CLASS.INFO;
  return <span className={`log-level ${cls}`}>{l}</span>;
}
