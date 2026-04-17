import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function ExceptionSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  if (!attrs.exceptionType) return null;
  return (
    <Section title="Exception">
      <KVRow label="Type" value={attrs.exceptionType} />
      <KVRow label="Message" value={attrs.exceptionMessage} />
      {attrs.exceptionStacktrace && (
        <pre className="sdd-stacktrace sdd-stacktrace--error">{attrs.exceptionStacktrace}</pre>
      )}
    </Section>
  );
}

export const ExceptionSection = memo(ExceptionSectionComponent);
