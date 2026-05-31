import { PageSurface } from "@shared/components/ui";

interface Props {
  readonly stacktrace: string;
}

/**
 * Renders a sample exception stacktrace as discrete, subtly separated frames.
 * Splits on newlines and drops trailing blank lines so the panel never shows
 * empty rows. Caller is responsible for hiding the panel when the trace is
 * empty (see ErrorGroupDetailPage).
 */
export function StackFramesPanel({ stacktrace }: Props): JSX.Element {
  const frames = stacktrace.split(/\r?\n/).filter((line) => line.trim().length > 0);

  return (
    <PageSurface padding="lg">
      <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
        Stack trace
      </div>
      <div className="mt-2 max-h-[320px] overflow-auto rounded-[6px] border border-border bg-surface-inset font-mono text-[12px] text-foreground">
        {frames.map((frame, i) => (
          <div
            key={`${i}-${frame}`}
            className="whitespace-pre-wrap break-words border-border border-b px-3 py-1 last:border-b-0"
          >
            {frame}
          </div>
        ))}
      </div>
    </PageSurface>
  );
}
