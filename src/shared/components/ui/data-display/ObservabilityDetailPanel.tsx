import { Tabs } from "@/components/ui";
import { Check, Clock, Copy, Filter, X } from "lucide-react";
import { type ReactNode, useState } from "react";

const EMPTY_VALUE_PLACEHOLDER = "—";
const COPY_CONFIRMATION_DURATION_MS = 1500;

type BoardFilterValue = string | number | boolean;

interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: "equals";
}

function isFilterValue(value: unknown): value is BoardFilterValue {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

interface CopyableValueProps {
  value: unknown;
}

function CopyableValue({ value }: CopyableValueProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">{EMPTY_VALUE_PLACEHOLDER}</span>;
  }

  const handleCopy = (): void => {
    if (!navigator.clipboard) return;

    void navigator.clipboard
      .writeText(String(value))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, COPY_CONFIRMATION_DURATION_MS);
      })
      .catch(() => undefined);
  };

  return (
    <div
      className="flex cursor-pointer items-start gap-1 break-all font-mono text-[12.5px] text-foreground leading-[1.5] transition-colors duration-100 hover:text-white"
      onClick={handleCopy}
      title="Click to copy"
    >
      <span>{String(value)}</span>
      {copied ? (
        <Check size={10} className="ml-1.5 text-success" />
      ) : (
        <Copy size={10} className="ml-1.5 opacity-35" />
      )}
    </div>
  );
}

export interface DetailPanelField {
  key: string;
  label: string;
  value: unknown;
  filterable?: boolean;
}

export interface ObservabilityDetailPanelProps {
  title?: string;
  titleBadge?: ReactNode;
  metaLine?: string;
  metaRight?: string;
  summary?: string;
  summaryNode?: ReactNode;
  fields?: DetailPanelField[];
  actions?: ReactNode;
  rawData?: unknown;
  onClose: () => void;
  onAddFilter?: (filter: BoardFilter) => void;
}

/**
 * Side detail panel for an observability row.
 * @param props Detail panel props.
 * @returns Detail panel UI.
 */
export function ObservabilityDetailPanel({
  title = "Detail",
  titleBadge,
  metaLine,
  metaRight,
  summary,
  summaryNode,
  fields = [],
  actions,
  rawData,
  onClose,
  onAddFilter,
}: ObservabilityDetailPanelProps): JSX.Element {
  const [tab, setTab] = useState<"fields" | "json">("fields");

  return (
    <div
      className="fixed top-16 right-0 bottom-0 z-[1100] flex w-[500px] animate-oboard-slide-in flex-col border-[color:var(--glass-border)] border-l bg-[color:var(--glass-bg)] shadow-[-12px_0_40px_rgba(0,0,0,0.55)]"
      style={{ backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}
      onClick={(event) => event.stopPropagation()}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-[color:var(--glass-border)] border-b px-5 py-[14px]">
        <div className="flex items-center gap-2 font-semibold text-[14px] text-foreground">
          {title}
          {titleBadge}
        </div>
        <button
          type="button"
          className="flex cursor-pointer items-center rounded-md border-none bg-transparent p-2 text-muted-foreground transition-all duration-100 hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* Meta bar */}
      {metaLine && (
        <div className="flex shrink-0 items-center gap-2 border-[color:var(--glass-border)] border-b px-5 py-2 font-mono text-[11.5px] text-muted-foreground">
          <Clock size={12} />
          <span>{metaLine}</span>
          {metaRight && (
            <span className="ml-auto text-[11px] text-muted-foreground opacity-70">
              {metaRight}
            </span>
          )}
        </div>
      )}

      {/* Summary */}
      {(summary || summaryNode) && (
        <div className="max-h-[110px] shrink-0 overflow-y-auto break-all border-[color:var(--glass-border)] border-b bg-[rgba(255,255,255,0.015)] px-5 py-3 font-mono text-[color:var(--text-secondary)] text-xs leading-[1.65]">
          {summaryNode || summary}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2 border-[color:var(--glass-border)] border-b px-5 py-[10px]">
          {actions}
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={tab}
        onChange={(nextTab) => setTab(nextTab as "fields" | "json")}
        variant="compact"
        size="sm"
        className="shrink-0 px-5"
        items={[
          { key: "fields", label: "Fields" },
          { key: "json", label: "JSON" },
        ]}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {tab === "fields" && (
          <div className="flex flex-col">
            {fields.map(({ key, label, value, filterable }) => {
              const canFilter = Boolean(filterable && onAddFilter && isFilterValue(value));

              return (
                <div
                  key={key}
                  className="group border-[color:var(--glass-border)] border-b py-[10px] last:border-b-0"
                >
                  <div className="mb-[5px] flex items-center gap-[5px] font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.06em]">
                    {label}
                    {canFilter && (
                      <button
                        type="button"
                        className="flex cursor-pointer items-center rounded-sm border-none bg-transparent px-[3px] text-muted-foreground opacity-0 transition-opacity duration-100 hover:bg-[var(--color-primary-subtle-15)] hover:text-primary group-hover:opacity-100"
                        onClick={() => {
                          if (onAddFilter && isFilterValue(value)) {
                            onAddFilter({ field: key, value, operator: "equals" });
                          }
                        }}
                        title={`Filter by ${label} = "${String(value)}"`}
                      >
                        <Filter size={10} />
                      </button>
                    )}
                  </div>
                  <CopyableValue value={value} />
                </div>
              );
            })}
          </div>
        )}

        {tab === "json" && (
          <pre className="whitespace-pre-wrap break-all rounded-[7px] border border-border bg-[rgba(255,255,255,0.02)] p-3.5 font-mono text-[11.5px] text-foreground leading-[1.65]">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
