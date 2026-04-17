import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function HttpSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  const method = attrs.attributesString?.["http.method"];
  const url = attrs.attributesString?.["http.url"] || attrs.attributesString?.["url.full"];
  const status =
    attrs.attributesString?.["http.status_code"] ||
    attrs.attributesString?.["http.response.status_code"];
  if (!method && !url && !status) return null;
  return (
    <Section title="HTTP">
      <KVRow label="Method" value={method} />
      <KVRow label="URL" value={url} mono />
      <KVRow label="Status Code" value={status} />
      <KVRow label="Route" value={attrs.attributesString?.["http.route"]} />
    </Section>
  );
}

export const HttpSection = memo(HttpSectionComponent);
