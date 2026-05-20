import { Braces } from "lucide-react";
import { memo } from "react";

import { HighlightedText } from "@shared/components/primitives/HighlightedText";

import { looksLikeJson } from "../../utils/jsonDetect";

interface Props {
  readonly body: string;
  readonly searchTerm?: string;
  readonly wrapLines?: boolean;
}

/** Truncated log body with optional search highlighting and a JSON indicator icon. */
function LogBodyCellComponent({ body, searchTerm, wrapLines }: Props) {
  const isJson = looksLikeJson(body);

  return (
    <div className="flex min-w-0 items-start gap-1.5">
      {isJson ? (
        <Braces
          size={12}
          className="mt-1 shrink-0 text-[var(--color-info)]"
          aria-label="JSON body"
        />
      ) : null}
      <HighlightedText
        className={`min-w-0 font-mono text-[13px] text-[var(--text-primary)] leading-5 ${
          wrapLines ? "whitespace-pre-wrap break-words" : "truncate"
        }`}
        text={body}
        match={searchTerm}
      />
    </div>
  );
}

export const LogBodyCell = memo(LogBodyCellComponent);
