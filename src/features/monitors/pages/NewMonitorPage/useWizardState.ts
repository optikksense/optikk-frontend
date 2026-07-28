import { useEffect, useRef, useState } from "react";

import type { CreateMonitorPayload, MonitorType } from "../../api/monitorsApi";

const DEFAULT: CreateMonitorPayload = {
  name: "",
  type: "metric",
  priority: "P2",
  scope: { tags: [] },
  query: {
    metric: { metric: "", aggregation: "avg", windowSec: 300 },
  },
  conditions: {
    comparator: "above",
    alertThreshold: 0.05,
    warnThreshold: 0.02,
    recoveryThreshold: 0.03,
    noDataAfterSec: 1800,
    noDataAs: "no_data",
  },
  notify: { channelIds: [] },
  evalEverySec: 300,
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
          : { metric: { metric: "", aggregation: "avg", windowSec: 300 } },
      };
    case "apm":
      return {
        ...payload,
        type,
        query: payload.query.apm
          ? payload.query
          : { apm: { service: "", track: "errors", windowSec: 300 } },
      };
    case "log":
      return {
        ...payload,
        type,
        query: payload.query.log
          ? payload.query
          : { log: { query: "", groupBy: "service", windowSec: 300 } },
      };
  }
}

export function useWizardState(initial?: CreateMonitorPayload) {
  const [draft, setDraft] = useState<CreateMonitorPayload>(initial ?? DEFAULT);
  const seededFromInitial = useRef(false);

  useEffect(() => {
    if (initial && !seededFromInitial.current) {
      seededFromInitial.current = true;
      setDraft(initial);
    }
  }, [initial]);

  useEffect(() => {
    if (initial) return;
    const prefill = parsePrefill();
    if (Object.keys(prefill).length > 0) {
      setDraft((prev) => {
        const merged = { ...prev, ...prefill };
        return applyTypeDefaults(merged, merged.type);
      });
    }
  }, [initial]);

  const setType = (type: MonitorType) => setDraft((prev) => applyTypeDefaults(prev, type));

  return { draft, setDraft, setType };
}
