import { Check, Copy } from "lucide-react";
import { memo, useCallback, useState } from "react";

export interface AttributeRow {
  readonly key: string;
  readonly value: string;
}

export interface AttributeGroup {
  readonly label: string;
  readonly rows: readonly AttributeRow[];
}

interface Props {
  readonly groups: readonly AttributeGroup[];
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy value"
      className="rounded p-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--text-primary)] group-hover:opacity-100"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function AttributeTable({ rows }: { rows: readonly AttributeRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.key}
          className="group flex items-start gap-2 border-b border-[var(--border-color)] py-1 text-[12px]"
        >
          <span className="w-40 shrink-0 truncate font-mono text-[var(--text-secondary)]" title={row.key}>
            {row.key}
          </span>
          <span className="min-w-0 flex-1 break-words font-mono text-[var(--text-primary)]">
            {row.value}
          </span>
          <CopyButton value={row.value} />
        </div>
      ))}
    </div>
  );
}

function DetailAttributesTabComponent({ groups }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.label} className="flex flex-col gap-1">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {group.label}
          </h4>
          <AttributeTable rows={group.rows} />
        </section>
      ))}
    </div>
  );
}

export const DetailAttributesTab = memo(DetailAttributesTabComponent);
