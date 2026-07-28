import { X } from "lucide-react";
import { memo, useState } from "react";

import type { TranslationWarning } from "../../types/filters";

interface Props {
  readonly warnings: readonly TranslationWarning[];
}

/**
 * Dismissible notice listing filters that parsed but could not be applied to
 * the query. Dismissal is keyed on the warning set, so a changed filter set
 * resurfaces the notice.
 */
function SearchTranslationNoticeComponent({ warnings }: Props) {
  const key = warnings.map((w) => `${w.code}:${w.field}:${w.message}`).join("|");
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  if (warnings.length === 0 || dismissedKey === key) return null;
  return (
    <div className="flex items-start gap-2 rounded border border-[color-mix(in_oklch,var(--color-warning),transparent_55%)] bg-[color-mix(in_oklch,var(--color-warning),transparent_90%)] px-2 py-1 text-[11px] text-warning">
      <div className="min-w-0 flex-1">
        <span className="font-medium">
          {warnings.length} filter{warnings.length > 1 ? "s" : ""} not applied:
        </span>{" "}
        {warnings.map((w) => w.message).join(" ")}
      </div>
      <button
        type="button"
        onClick={() => setDismissedKey(key)}
        aria-label="Dismiss filter warnings"
        className="text-current/60 transition hover:text-current"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export const SearchTranslationNotice = memo(SearchTranslationNoticeComponent);
