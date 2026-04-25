import { useMemo } from "react";

import type { RelatedTrace, SpanAttributes, SpanEvent } from "../../types";

interface TabItem {
  key: string;
  label: string;
}

/** Builds tab set, hiding tabs that have no data (Datadog behavior). */
export function useTabItems(
  selectedSpanId: string | null,
  spanEvents: SpanEvent[],
  relatedTraces: RelatedTrace[],
  spanAttributes: SpanAttributes | null,
) {
  const eventCount = useMemo(
    () => (selectedSpanId ? spanEvents.filter((e) => e.spanId === selectedSpanId).length : 0),
    [spanEvents, selectedSpanId],
  );
  const flags = useMemo(() => detectTabs(spanAttributes), [spanAttributes]);

  return useMemo(() => buildItems(flags, eventCount, relatedTraces.length), [flags, eventCount, relatedTraces.length]);
}

interface TabFlags {
  hasErrors: boolean;
  hasHost: boolean;
  hasNetwork: boolean;
  hasCode: boolean;
  linkCount: number;
}

function detectTabs(attrs: SpanAttributes | null): TabFlags {
  if (!attrs) return { hasErrors: false, hasHost: false, hasNetwork: false, hasCode: false, linkCount: 0 };
  const a = attrs.attributesString ?? {};
  const res = attrs.resourceAttributes ?? {};
  const hasErrors = Boolean(attrs.exceptionType || attrs.exceptionMessage || attrs.exceptionStacktrace);
  const hasHost = Boolean(res["host.name"] || res["k8s.pod.name"] || a["host.name"] || a["k8s.pod.name"]);
  const hasNetwork = Boolean(a["peer.service"] || a["net.peer.name"] || a["http.url"] || a["url.full"] || a["server.address"]);
  const hasCode = Boolean(a["code.filepath"] || a["code.function"] || a["http.url"] || a["url.full"]);
  return { hasErrors, hasHost, hasNetwork, hasCode, linkCount: attrs.links?.length ?? 0 };
}

function buildItems(flags: TabFlags, eventCount: number, relatedCount: number): readonly TabItem[] {
  const items: TabItem[] = [{ key: "attributes", label: "Info" }];
  if (flags.hasErrors) items.push({ key: "errors", label: "Errors" });
  items.push({ key: "events", label: `Events${eventCount > 0 ? ` (${eventCount})` : ""}` });
  items.push({ key: "logs", label: "Logs" });
  items.push({ key: "metrics", label: "Metrics" });
  if (flags.hasHost) items.push({ key: "host", label: "Host" });
  if (flags.hasNetwork) items.push({ key: "network", label: "Network" });
  if (flags.hasCode) items.push({ key: "code", label: "Code" });
  if (flags.linkCount > 0) items.push({ key: "links", label: `Links (${flags.linkCount})` });
  items.push({ key: "selftime", label: "Self-Time" });
  items.push({ key: "related", label: `Related${relatedCount > 0 ? ` (${relatedCount})` : ""}` });
  return items;
}
