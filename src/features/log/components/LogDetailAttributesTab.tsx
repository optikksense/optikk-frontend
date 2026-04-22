import { memo, useMemo, useState } from "react";

import type { LogRecord } from "../types/log";

interface Props {
  readonly row: LogRecord;
}

type Group = { readonly label: string; readonly entries: readonly [string, string][] };

function stringifyValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function flattenMap(
  name: string,
  raw: Readonly<Record<string, unknown>> | undefined
): Group | null {
  if (!raw) return null;
  const entries = Object.entries(raw)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, stringifyValue(value)] as const)
    .map(([key, value]) => [key, value] as [string, string]);
  if (entries.length === 0) return null;
  return { label: name, entries };
}

function buildGroups(row: LogRecord): readonly Group[] {
  const out: Group[] = [];
  const resourceGroup = flattenMap("Resource", row.resource);
  const attrGroup: Group = {
    label: "Attributes",
    entries: [
      ...Object.entries(row.attributes_string ?? {}),
      ...Object.entries(row.attributes_number ?? {}).map(
        ([k, v]) => [k, String(v)] as [string, string]
      ),
      ...Object.entries(row.attributes_bool ?? {}).map(
        ([k, v]) => [k, String(v)] as [string, string]
      ),
    ],
  };
  const scopeGroup: Group = {
    label: "Scope",
    entries: [
      ["scope_name", row.scope_name ?? "—"],
      ["scope_version", row.scope_version ?? "—"],
    ],
  };
  if (resourceGroup) out.push(resourceGroup);
  if (attrGroup.entries.length > 0) out.push(attrGroup);
  out.push(scopeGroup);
  return out;
}

async function copyEntry(value: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore */
  }
}

/**
 * Logs attribute grouping per plan §D.3: Resource / Attributes / Scope.
 * Free-text filter narrows the visible keys; click to copy a value.
 */
export const LogDetailAttributesTab = memo(function LogDetailAttributesTab({ row }: Props) {
  const [filter, setFilter] = useState("");
  const groups = useMemo(() => buildGroups(row), [row]);
  const lower = filter.trim().toLowerCase();
  return (
    <div className="flex flex-col gap-3 p-3">
      <input
        type="text"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter keys..."
        className="rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1 text-[12px]"
      />
      {groups.map((group) => (
        <section key={group.label}>
          <h4 className="mb-1 text-[11px] uppercase text-[var(--text-muted)]">{group.label}</h4>
          <dl className="grid grid-cols-[minmax(120px,180px)_1fr] gap-x-3 gap-y-1">
            {group.entries
              .filter(([key]) => lower === "" || key.toLowerCase().includes(lower))
              .map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="truncate font-mono text-[11px] text-[var(--text-muted)]">{key}</dt>
                  <dd
                    className="cursor-copy truncate font-mono text-[12px] text-[var(--text-primary)]"
                    onClick={() => copyEntry(value)}
                    title="Click to copy"
                  >
                    {value}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
});

export default LogDetailAttributesTab;
