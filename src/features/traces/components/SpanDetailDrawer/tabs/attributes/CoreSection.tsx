import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function CoreSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  return (
    <Section title="Core">
      <KVRow label="Span ID" value={attrs.spanId} mono />
      <KVRow label="Trace ID" value={attrs.traceId} mono />
      <KVRow label="Service" value={attrs.serviceName} />
      <KVRow label="Operation" value={attrs.operationName} />
    </Section>
  );
}

export const CoreSection = memo(CoreSectionComponent);
