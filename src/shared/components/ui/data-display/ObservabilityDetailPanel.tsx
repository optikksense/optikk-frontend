import { Tabs } from '@/components/ui';
import { Clock, Copy, Check, Filter, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const EMPTY_VALUE_PLACEHOLDER = '—';
const COPY_CONFIRMATION_DURATION_MS = 1500;

type BoardFilterValue = string | number | boolean;

interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: 'equals';
}

function isFilterValue(value: unknown): value is BoardFilterValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

interface CopyableValueProps {
  value: unknown;
}

function CopyableValue({ value }: CopyableValueProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === '') {
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
      className="flex items-start gap-1 text-[12.5px] text-foreground font-mono break-all cursor-pointer transition-colors duration-100 leading-[1.5] hover:text-white"
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
  title = 'Detail',
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
  const [tab, setTab] = useState<'fields' | 'json'>('fields');

  return (
    <div
      className="fixed top-16 right-0 bottom-0 w-[500px] z-[1100] flex flex-col bg-[color:var(--glass-bg)] border-l border-[color:var(--glass-border)] shadow-[-12px_0_40px_rgba(0,0,0,0.55)] animate-oboard-slide-in"
      style={{ backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}
      onClick={(event) => event.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-[14px] border-b border-[color:var(--glass-border)] shrink-0">
        <div className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          {title}
          {titleBadge}
        </div>
        <button
          className="bg-transparent border-none text-muted-foreground cursor-pointer p-2 rounded-md flex items-center transition-all duration-100 hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* Meta bar */}
      {metaLine && (
        <div className="flex items-center gap-2 px-5 py-2 text-[11.5px] text-muted-foreground border-b border-[color:var(--glass-border)] shrink-0 font-mono">
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
        <div className="px-5 py-3 border-b border-[color:var(--glass-border)] font-mono text-xs leading-[1.65] break-all max-h-[110px] overflow-y-auto bg-[rgba(255,255,255,0.015)] shrink-0 text-[color:var(--text-secondary)]">
          {summaryNode || summary}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex gap-2 px-5 py-[10px] border-b border-[color:var(--glass-border)] shrink-0 flex-wrap">
          {actions}
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={tab}
        onChange={(nextTab) => setTab(nextTab as 'fields' | 'json')}
        variant="compact"
        size="sm"
        className="shrink-0 px-5"
        items={[
          { key: 'fields', label: 'Fields' },
          { key: 'json', label: 'JSON' },
        ]}
      />

      {/* Body */}
      <div className="px-5 py-3 flex-1 overflow-y-auto">
        {tab === 'fields' && (
          <div className="flex flex-col">
            {fields.map(({ key, label, value, filterable }) => {
              const canFilter = Boolean(filterable && onAddFilter && isFilterValue(value));

              return (
                <div
                  key={key}
                  className="group py-[10px] border-b border-[color:var(--glass-border)] last:border-b-0"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-[5px] flex items-center gap-[5px]">
                    {label}
                    {canFilter && (
                      <button
                        className="bg-transparent border-none text-muted-foreground px-[3px] cursor-pointer flex items-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-100 hover:bg-[var(--color-primary-subtle-15)] hover:text-primary"
                        onClick={() => {
                          if (onAddFilter && isFilterValue(value)) {
                            onAddFilter({ field: key, value, operator: 'equals' });
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

        {tab === 'json' && (
          <pre className="font-mono text-[11.5px] leading-[1.65] whitespace-pre-wrap break-all text-foreground bg-[rgba(255,255,255,0.02)] p-3.5 rounded-[7px] border border-border">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
