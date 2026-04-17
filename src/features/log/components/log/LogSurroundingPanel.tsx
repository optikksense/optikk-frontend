import { useTeamId } from "@app/store/appStore";
import { logsService } from "@shared/api/logsService";
import { tsLabel } from "@shared/utils/time";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useEffect, useState } from "react";
import type { LogRecord } from "../../types";
import { LevelBadge } from "./LogRow";

interface SurroundingResponse {
  anchor: LogRecord;
  before: LogRecord[];
  after: LogRecord[];
}

interface LogSurroundingPanelProps {
  log: LogRecord;
}

function SurroundingRow({ log, isAnchor }: { log: LogRecord; isAnchor?: boolean }) {
  const level = (log.level ?? log.severity_text ?? log.severityText) as string | undefined;
  const message = (log.body ?? log.message) as string | undefined;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        padding: "4px 8px",
        borderRadius: 6,
        background: isAnchor ? "rgba(10,174,214,0.12)" : "transparent",
        border: isAnchor ? "1px solid rgba(10,174,214,0.35)" : "1px solid transparent",
        opacity: isAnchor ? 1 : 0.6,
      }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
          minWidth: 130,
        }}
      >
        {tsLabel(log.timestamp)}
      </span>
      <LevelBadge level={level} />
      <span
        className="font-mono"
        style={{ fontSize: 11, wordBreak: "break-word", flex: 1, color: "var(--text-primary)" }}
      >
        {message ?? "—"}
      </span>
    </div>
  );
}

export default function LogSurroundingPanel({ log }: LogSurroundingPanelProps) {
  const selectedTeamId = useTeamId();
  const logTimestamp = String(log.timestamp);

  const [localBefore, setLocalBefore] = useState<LogRecord[]>([]);
  const [localAfter, setLocalAfter] = useState<LogRecord[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);

  // Avoid running this query aggressively per keystroke or without a true logId
  const { data, isPending: isLoading, isError } = useStandardQuery({
    queryKey: ["logs", "surrounding", logTimestamp],
    queryFn: async () => {
      if (!logTimestamp) return null;
      return (await logsService.getLogSurrounding(
        selectedTeamId,
        logTimestamp,
        20,
        20
      )) as SurroundingResponse;
    },
    enabled: !!logTimestamp,
    staleTime: 300000,
  });

  // Sync initial query results into local state
  useEffect(() => {
    if (data) {
      setLocalBefore(data.before ?? []);
      setLocalAfter(data.after ?? []);
    }
  }, [data]);

  const handleLoadOlder = async () => {
    if (!selectedTeamId || localBefore.length === 0) return;
    try {
      setLoadingOlder(true);
      const oldestTs = String(localBefore[0].timestamp);
      if (!oldestTs) return;
      const res = (await logsService.getLogSurrounding(
        selectedTeamId,
        oldestTs,
        40,
        0
      )) as SurroundingResponse;
      if (res.before?.length) {
        setLocalBefore((prev) => [...res.before, ...prev]);
      }
    } catch {
      // Error propagated via query state; no logging needed.
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleLoadNewer = async () => {
    if (!selectedTeamId || localAfter.length === 0) return;
    try {
      setLoadingNewer(true);
      const newestTs = String(localAfter[localAfter.length - 1].timestamp);
      if (!newestTs) return;
      const res = (await logsService.getLogSurrounding(
        selectedTeamId,
        newestTs,
        0,
        40
      )) as SurroundingResponse;
      if (res.after?.length) {
        setLocalAfter((prev) => [...prev, ...res.after]);
      }
    } catch {
      // Error propagated via query state; no logging needed.
    } finally {
      setLoadingNewer(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div
        style={{ padding: 16, color: "var(--text-secondary)", fontSize: 12, textAlign: "center" }}
      >
        <div className="spinner" style={{ display: "inline-block", marginBottom: 8 }} />
        <br />
        Loading context…
      </div>
    );
  }

  if (isError || (!data && !isLoading)) {
    return (
      <div
        style={{ padding: 16, color: "var(--text-secondary)", fontSize: 12, textAlign: "center" }}
      >
        Could not load surrounding context.
      </div>
    );
  }

  const anchor = data?.anchor;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 0",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {localBefore.length > 0 && (
        <button
          type="button"
          onClick={handleLoadOlder}
          disabled={loadingOlder}
          style={{
            margin: "0 8px 8px 8px",
            padding: "6px",
            background: "var(--literal-rgba-255-255-255-0p05)",
            border: "1px dashed var(--glass-border)",
            borderRadius: 6,
            color: "var(--text-muted)",
            fontSize: 11,
            cursor: loadingOlder ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loadingOlder) e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            if (!loadingOlder) e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {loadingOlder ? "Loading..." : "Load older logs ⇡"}
        </button>
      )}

      {localBefore.map((l, i) => (
        <SurroundingRow key={String(l.timestamp) ?? `before-${i}`} log={l} />
      ))}

      {anchor && <SurroundingRow log={anchor} isAnchor />}

      {localAfter.map((l, i) => (
        <SurroundingRow key={String(l.timestamp) ?? `after-${i}`} log={l} />
      ))}

      {localAfter.length > 0 && (
        <button
          type="button"
          onClick={handleLoadNewer}
          disabled={loadingNewer}
          style={{
            margin: "8px 8px 0 8px",
            padding: "6px",
            background: "var(--literal-rgba-255-255-255-0p05)",
            border: "1px dashed var(--glass-border)",
            borderRadius: 6,
            color: "var(--text-muted)",
            fontSize: 11,
            cursor: loadingNewer ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loadingNewer) e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            if (!loadingNewer) e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {loadingNewer ? "Loading..." : "Load newer logs ⇣"}
        </button>
      )}
    </div>
  );
}
