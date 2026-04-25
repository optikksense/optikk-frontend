import type { SpanAttributes } from "../../../types";

import { KVRow, Section } from "./attributes/Section";

/** Network tab — peer service, ports, URL, TLS. Mirrors Datadog's Network tab. */
export function NetworkTab({ attrs }: { attrs: SpanAttributes | null }) {
  if (!attrs) return <EmptyState msg="Select a span to see network info." />;
  const a = attrs.attributesString ?? {};
  const peerService = a["peer.service"];
  const peerName = a["net.peer.name"];
  const peerPort = a["net.peer.port"];
  const netTransport = a["net.transport"];
  const httpUrl = a["http.url"] ?? a["url.full"];
  const httpTarget = a["http.target"];
  const httpScheme = a["http.scheme"];
  const serverAddr = a["server.address"];
  const serverPort = a["server.port"];
  const hasAny = peerService || peerName || peerPort || httpUrl || serverAddr;
  if (!hasAny) return <EmptyState msg="No network attributes on this span." />;
  return (
    <div>
      <Section title="Peer">
        <KVRow label="Service" value={peerService} mono />
        <KVRow label="Name" value={peerName} mono />
        <KVRow label="Port" value={peerPort} mono />
        <KVRow label="Transport" value={netTransport} mono />
      </Section>
      <Section title="Server">
        <KVRow label="Address" value={serverAddr} mono />
        <KVRow label="Port" value={serverPort} mono />
      </Section>
      <Section title="URL">
        <KVRow label="Full" value={httpUrl} mono />
        <KVRow label="Target" value={httpTarget} mono />
        <KVRow label="Scheme" value={httpScheme} mono />
      </Section>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}
