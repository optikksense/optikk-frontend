import type { SpanAttributes } from "../../../types";

import { KVRow, Section } from "./attributes/Section";

/** Error/exception details tab. Datadog parity: dedicated tab with stacktrace highlighter. */
export function ErrorsTab({ attrs }: { attrs: SpanAttributes | null }) {
  if (!attrs) return <EmptyState msg="Select a span to see errors." />;
  const hasException = Boolean(attrs.exceptionType || attrs.exceptionMessage || attrs.exceptionStacktrace);
  if (!hasException) return <EmptyState msg="No errors on this span." />;
  return (
    <div>
      <Section title="Exception">
        <KVRow label="Type" value={attrs.exceptionType} mono />
        <KVRow label="Message" value={attrs.exceptionMessage} />
      </Section>
      {attrs.exceptionStacktrace ? (
        <Section title="Stacktrace">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[var(--bg-secondary)] p-3 font-mono text-[11px] leading-relaxed text-[var(--text-primary)]">
            {attrs.exceptionStacktrace}
          </pre>
        </Section>
      ) : null}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}
