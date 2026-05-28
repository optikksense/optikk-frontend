import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { memo, useCallback, useState } from "react";

interface Props {
  readonly data: Record<string, unknown> | unknown[];
  readonly depth?: number;
}

/** Recursively renders a collapsible JSON tree with syntax coloring. */
function JsonTreeViewComponent({ data, depth = 0 }: Props) {
  const entries = Array.isArray(data)
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data);

  return (
    <div className={depth > 0 ? "ml-4 border-[var(--border-color)] border-l pl-2" : ""}>
      {entries.map(([key, value]) => (
        <JsonNode key={key} nodeKey={key} value={value} depth={depth} />
      ))}
    </div>
  );
}

function JsonNode({
  nodeKey,
  value,
  depth,
}: {
  readonly nodeKey: string;
  readonly value: unknown;
  readonly depth: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isObject = typeof value === "object" && value !== null;

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(
      typeof value === "string" ? value : JSON.stringify(value, null, 2)
    );
  }, [value]);

  if (isObject) {
    const count = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    const label = Array.isArray(value) ? `[${count}]` : `{${count}}`;
    return (
      <div className="group/node">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 rounded py-0.5 font-mono text-[12px] hover:bg-[var(--bg-hover)]"
        >
          {open ? (
            <ChevronDown size={12} className="text-[var(--text-muted)]" />
          ) : (
            <ChevronRight size={12} className="text-[var(--text-muted)]" />
          )}
          <span className="text-[var(--text-secondary)]">{nodeKey}</span>
          <span className="text-[var(--text-muted)]">{label}</span>
        </button>
        {open ? (
          <JsonTreeViewComponent
            data={value as Record<string, unknown> | unknown[]}
            depth={depth + 1}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="group/leaf flex items-center gap-1 py-0.5 pl-4 font-mono text-[12px]">
      <span className="text-[var(--text-secondary)]">{nodeKey}:</span>
      <span className={valueClassName(value)}>{formatValue(value)}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="ml-1 opacity-0 transition-opacity group-hover/leaf:opacity-100"
        title="Copy value"
      >
        <Copy size={10} className="text-[var(--text-muted)]" />
      </button>
    </div>
  );
}

function valueClassName(value: unknown): string {
  if (typeof value === "string") return "text-[var(--color-success)]";
  if (typeof value === "number") return "text-[var(--chart-1)]";
  if (typeof value === "boolean") return "text-[var(--color-warning)]";
  if (value === null) return "text-[var(--text-muted)] italic";
  return "text-[var(--text-primary)]";
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "null";
  return String(value);
}

export const JsonTreeView = memo(JsonTreeViewComponent);
