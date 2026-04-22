import { memo, useState } from "react";

interface Props {
  readonly body: string;
  readonly maxChars?: number;
}

function shouldTruncate(body: string, maxChars: number): boolean {
  return body.length > maxChars || body.includes("\n");
}

/**
 * Dense body cell: single-line by default with `…`, expands on click to
 * show the full payload. No parsing here — that lives in the detail drawer
 * (which has a structured attributes tab).
 */
export const LogBodyCell = memo(function LogBodyCell({ body, maxChars = 240 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const truncatable = shouldTruncate(body, maxChars);

  if (!truncatable) {
    return <span className="whitespace-pre-wrap font-mono text-[12px] text-[var(--text-primary)]">{body}</span>;
  }

  const display = expanded ? body : `${body.slice(0, maxChars).replace(/\n/g, " ")}…`;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setExpanded((prev) => !prev);
      }}
      className="w-full cursor-text whitespace-pre-wrap text-left font-mono text-[12px] text-[var(--text-primary)] hover:text-[var(--text-primary)]"
      title={expanded ? "Click to collapse" : "Click to expand"}
    >
      {display}
    </button>
  );
});

export default LogBodyCell;
