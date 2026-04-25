import { Check, Link as LinkIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";

import type { ExplorerFilter } from "@/features/explorer/types/filters";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly fromMs?: number;
  readonly toMs?: number;
  /** Override the path. Defaults to current location.pathname. */
  readonly path?: string;
}

/**
 * Deep-link share (A9). Copies the current page URL with `?filters=…&from=…&to=…`
 * to the clipboard so a teammate can open the exact same view.
 */
function ShareLinkButtonComponent({ filters, fromMs, toMs, path }: Props) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    const url = buildShareUrl({ filters, fromMs, toMs, path });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied — still surface feedback.
      setCopied(false);
    }
  }, [filters, fromMs, toMs, path]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      aria-label="Copy shareable link"
    >
      {copied ? <Check size={12} /> : <LinkIcon size={12} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}

function buildShareUrl(opts: {
  filters: readonly ExplorerFilter[];
  fromMs?: number;
  toMs?: number;
  path?: string;
}): string {
  const params = new URLSearchParams();
  const encoded = encodeFilters(opts.filters);
  if (encoded) params.set("filters", encoded);
  if (opts.fromMs) params.set("from", String(opts.fromMs));
  if (opts.toMs) params.set("to", String(opts.toMs));
  const qs = params.toString();
  const path = opts.path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return qs ? `${origin}${path}?${qs}` : `${origin}${path}`;
}

function encodeFilters(filters: readonly ExplorerFilter[]): string | null {
  if (filters.length === 0) return null;
  return filters
    .map((f) => `${f.field}:${f.op}:${encodeURIComponent(f.value)}`)
    .join(";");
}

export const ShareLinkButton = memo(ShareLinkButtonComponent);
