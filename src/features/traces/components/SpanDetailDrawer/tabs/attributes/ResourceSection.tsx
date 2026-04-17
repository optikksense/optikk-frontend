import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function ResourceSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  const entries = Object.entries(attrs.resourceAttributes ?? {});
  if (entries.length === 0) return null;
  return (
    <Section title="Resource Attributes">
      {entries.map(([k, v]) => (
        <KVRow key={k} label={k} value={v} mono />
      ))}
    </Section>
  );
}

export const ResourceSection = memo(ResourceSectionComponent);
