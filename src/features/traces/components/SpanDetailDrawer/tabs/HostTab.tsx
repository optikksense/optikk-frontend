import type { SpanAttributes } from "../../../types";

import { KVRow, Section } from "./attributes/Section";

/** Host / infrastructure info tab. Datadog parity: surfaces host/pod/container + k8s names. */
export function HostTab({ attrs }: { attrs: SpanAttributes | null }) {
  if (!attrs) return <EmptyState msg="Select a span to see host info." />;
  const res = attrs.resourceAttributes ?? {};
  const attrStr = attrs.attributesString ?? {};
  const hostName = res["host.name"] ?? attrStr["host.name"];
  const hostIp = res["host.ip"] ?? attrStr["host.ip"];
  const hostArch = res["host.arch"] ?? attrStr["host.arch"];
  const podName = res["k8s.pod.name"] ?? attrStr["k8s.pod.name"];
  const namespace = res["k8s.namespace.name"] ?? attrStr["k8s.namespace.name"];
  const container = res["container.name"] ?? attrStr["container.name"];
  const serviceInstance = res["service.instance.id"] ?? attrStr["service.instance.id"];
  const hasAny = hostName || hostIp || podName || namespace || container || serviceInstance;
  if (!hasAny) return <EmptyState msg="No host attributes on this span." />;
  return (
    <div>
      <Section title="Host">
        <KVRow label="Name" value={hostName} mono />
        <KVRow label="IP" value={hostIp} mono />
        <KVRow label="Arch" value={hostArch} mono />
        <KVRow label="Instance" value={serviceInstance} mono />
      </Section>
      <Section title="Kubernetes">
        <KVRow label="Pod" value={podName} mono />
        <KVRow label="Namespace" value={namespace} mono />
        <KVRow label="Container" value={container} mono />
      </Section>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}
