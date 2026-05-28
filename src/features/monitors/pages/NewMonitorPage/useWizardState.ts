import { useEffect, useState } from "react";

import type { CreateMonitorPayload, MonitorType } from "../../api/monitorsApi";

const DEFAULT: CreateMonitorPayload = {
  name: "",
  type: "metric",
  priority: "P2",
  scope: { tags: [] },
  query: {
    metric: { metric: "", aggregation: "avg", window_sec: 300 },
  },
  conditions: {
    comparator: "above",
    alert_threshold: 0.05,
    warn_threshold: 0.02,
    recovery_threshold: 0.03,
    no_data_after_sec: 1800,
    no_data_as: "no_data",
  },
  notify: { channel_ids: [] },
  eval_every_sec: 300,
  tags: [],
};

// Parse the inbound CreateMonitorButton querystring (`?from=traces&filters=…`).
// Returns prefill scope tags + a default type per source.
function parsePrefill(): Partial<CreateMonitorPayload> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const filters = params.get("filters");
  const out: Partial<CreateMonitorPayload> = {};
  if (from === "traces") {
    out.type = "apm";
  } else if (from === "logs") {
    out.type = "log";
  }
  if (filters) {
    const tags = filters
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((seg) => {
        const parts = seg.split(":");
        if (parts.length < 3) return null;
        return { key: parts[0], value: parts.slice(2).join(":") };
      })
      .filter((t): t is { key: string; value: string } => t !== null);
    if (tags.length > 0) out.scope = { tags };
  }
  return out;
}

function applyTypeDefaults(payload: CreateMonitorPayload, type: MonitorType): CreateMonitorPayload {
  switch (type) {
    case "metric":
      return {
        ...payload,
        type,
        query: payload.query.metric
          ? payload.query
          : { metric: { metric: "", aggregation: "avg", window_sec: 300 } },
      };
    case "apm":
      return {
        ...payload,
        type,
        query: payload.query.apm
          ? payload.query
          : { apm: { service: "", track: "errors", window_sec: 300 } },
      };
    case "log":
      return {
        ...payload,
        type,
        query: payload.query.log
          ? payload.query
          : { log: { query: "", group_by: "service", window_sec: 300 } },
      };
  }
}

export function useWizardState() {
  const [draft, setDraft] = useState<CreateMonitorPayload>(DEFAULT);

  useEffect(() => {
    const prefill = parsePrefill();
    if (Object.keys(prefill).length > 0) {
      setDraft((prev) => {
        const merged = { ...prev, ...prefill };
        return applyTypeDefaults(merged, merged.type);
      });
    }
  }, []);

  const setType = (type: MonitorType) =>
    setDraft((prev) => applyTypeDefaults(prev, type));

  return { draft, setDraft, setType };
}
