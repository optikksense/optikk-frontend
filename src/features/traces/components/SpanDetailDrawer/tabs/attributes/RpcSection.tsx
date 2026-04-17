import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function RpcSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  const system = attrs.attributesString?.["rpc.system"];
  const service = attrs.attributesString?.["rpc.service"];
  if (!system && !service) return null;
  return (
    <Section title="RPC">
      <KVRow label="System" value={system} />
      <KVRow label="Service" value={service} />
      <KVRow label="Method" value={attrs.attributesString?.["rpc.method"]} />
      <KVRow label="gRPC Status" value={attrs.attributesString?.["rpc.grpc.status_code"]} />
    </Section>
  );
}

export const RpcSection = memo(RpcSectionComponent);
