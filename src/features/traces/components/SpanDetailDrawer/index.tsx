import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate } from 'react-router-dom';
import { Tabs, Badge, Input, Surface, Skeleton } from '@/components/ui';
import { formatDuration, formatTimestamp } from '@shared/utils/formatters';
import type { SpanAttributes, SpanEvent, SpanSelfTime, RelatedTrace } from '../../types';
import './SpanDetailDrawer.css';

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'default'> = {
  ERROR: 'error',
  OK: 'success',
  UNSET: 'default',
};



function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sdd-section">
      <div className="sdd-section__title">{title}</div>
      {children}
    </div>
  );
}

function KVRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="sdd-kv">
      <span className="sdd-kv__label">{label}</span>
      <span className={`sdd-kv__value ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}



function VirtualizedAttrTable({ attrs }: { attrs: [string, string][] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: attrs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  if (attrs.length === 0) {
    return (
      <div className="sdd-attr-table">
        <div className="sdd-attr-table__header">
          <span className="sdd-attr-table__col-key">Key</span>
          <span className="sdd-attr-table__col-val">Value</span>
        </div>
        <div className="sdd-empty">No matching attributes</div>
      </div>
    );
  }

  return (
    <div className="sdd-attr-table">
      <div className="sdd-attr-table__header">
        <span className="sdd-attr-table__col-key">Key</span>
        <span className="sdd-attr-table__col-val">Value</span>
      </div>
      <div
        ref={parentRef}
        className="sdd-attr-table__body"
        style={{ maxHeight: 400, overflow: 'auto' }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const [k, v] = attrs[virtualRow.index];
            return (
              <div
                key={k}
                className="sdd-attr-table__row"
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  width: '100%',
                  height: virtualRow.size,
                }}
              >
                <span className="sdd-attr-table__col-key font-mono text-xs">{k}</span>
                <span className="sdd-attr-table__col-val font-mono text-xs break-word">{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



function AttributesTab({ attrs, loading }: { attrs: SpanAttributes | null; loading: boolean }) {
  const [attrSearch, setAttrSearch] = useState('');
  if (loading)
    return (
      <div className="sdd-center">
        <Skeleton count={4} />
      </div>
    );
  if (!attrs) return <div className="sdd-center sdd-empty">Select a span to view attributes</div>;

  const allAttrs = { ...attrs.attributes };
  const filteredAttrs = Object.entries(allAttrs).filter(
    ([k, v]) =>
      attrSearch === '' ||
      k.toLowerCase().includes(attrSearch.toLowerCase()) ||
      (v ?? '').toLowerCase().includes(attrSearch.toLowerCase())
  );

  const hasHTTP =
    attrs.attributesString?.['http.method'] ||
    attrs.attributesString?.['http.url'] ||
    attrs.attributesString?.['http.status_code'];
  const hasDB = attrs.dbSystem || attrs.dbName || attrs.dbStatement;
  const hasRPC = attrs.attributesString?.['rpc.system'] || attrs.attributesString?.['rpc.service'];

  return (
    <div>
      <Section title="Core">
        <KVRow label="Span ID" value={attrs.spanId} mono />
        <KVRow label="Trace ID" value={attrs.traceId} mono />
        <KVRow label="Service" value={attrs.serviceName} />
        <KVRow label="Operation" value={attrs.operationName} />
      </Section>

      {attrs.exceptionType && (
        <Section title="Exception">
          <KVRow label="Type" value={attrs.exceptionType} />
          <KVRow label="Message" value={attrs.exceptionMessage} />
          {attrs.exceptionStacktrace && (
            <pre className="sdd-stacktrace sdd-stacktrace--error">{attrs.exceptionStacktrace}</pre>
          )}
        </Section>
      )}

      {hasHTTP && (
        <Section title="HTTP">
          <KVRow label="Method" value={attrs.attributesString?.['http.method']} />
          <KVRow
            label="URL"
            value={attrs.attributesString?.['http.url'] || attrs.attributesString?.['url.full']}
            mono
          />
          <KVRow
            label="Status Code"
            value={
              attrs.attributesString?.['http.status_code'] ||
              attrs.attributesString?.['http.response.status_code']
            }
          />
          <KVRow label="Route" value={attrs.attributesString?.['http.route']} />
        </Section>
      )}

      {hasDB && (
        <Section title="Database">
          <KVRow label="System" value={attrs.dbSystem} />
          <KVRow label="Database" value={attrs.dbName} />
          <KVRow label="Operation" value={attrs.attributesString?.['db.operation']} />
          {attrs.dbStatement && (
            <div className="mt-xs">
              <div className="sdd-sublabel">Statement</div>
              <pre className="sdd-codeblock">{attrs.dbStatement}</pre>
            </div>
          )}
          {attrs.dbStatementNormalized && attrs.dbStatementNormalized !== attrs.dbStatement && (
            <div className="mt-xs">
              <div className="sdd-sublabel">Normalized</div>
              <pre className="sdd-codeblock sdd-codeblock--info">{attrs.dbStatementNormalized}</pre>
            </div>
          )}
        </Section>
      )}

      {hasRPC && (
        <Section title="RPC">
          <KVRow label="System" value={attrs.attributesString?.['rpc.system']} />
          <KVRow label="Service" value={attrs.attributesString?.['rpc.service']} />
          <KVRow label="Method" value={attrs.attributesString?.['rpc.method']} />
          <KVRow label="gRPC Status" value={attrs.attributesString?.['rpc.grpc.status_code']} />
        </Section>
      )}

      {Object.keys(attrs.resourceAttributes ?? {}).length > 0 && (
        <Section title="Resource Attributes">
          {Object.entries(attrs.resourceAttributes).map(([k, v]) => (
            <KVRow key={k} label={k} value={v} mono />
          ))}
        </Section>
      )}

      <Section title="All Attributes">
        <Input
          placeholder="Search attributes..."
          value={attrSearch}
          onChange={(e) => setAttrSearch(e.target.value)}
          variant="search"
          className="mb-xs"
        />
        <VirtualizedAttrTable attrs={filteredAttrs} />
      </Section>
    </div>
  );
}



function EventsTab({
  events,
  selectedSpanId,
}: {
  events: SpanEvent[];
  selectedSpanId: string | null;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const spanEvents = events.filter((e) => !selectedSpanId || e.spanId === selectedSpanId);

  if (spanEvents.length === 0) {
    return <div className="sdd-center sdd-empty">No events recorded for this span</div>;
  }

  return (
    <div className="flex-col gap-xs">
      {spanEvents.map((ev, idx) => {
        const key = `${ev.spanId}-${idx}`;
        const isException = ev.eventName === 'exception';
        let parsed: Record<string, string> = {};
        try {
          parsed = JSON.parse(ev.attributes);
        } catch {
          /* empty */
        }
        const isExpanded = expanded.has(key);

        return (
          <div key={key} className={`sdd-event ${isException ? 'sdd-event--error' : ''}`}>
            <div
              className="sdd-event__header"
              onClick={() => {
                if (!isException) return;
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                });
              }}
            >
              <span className="font-mono text-xs text-muted">{formatTimestamp(ev.timestamp)}</span>
              <Badge variant={isException ? 'error' : 'default'}>{ev.eventName}</Badge>
              {parsed['exception.type'] && (
                <span className="text-sm text-error font-medium">{parsed['exception.type']}</span>
              )}
              {isException && <span className="sdd-event__toggle">{isExpanded ? '▲' : '▼'}</span>}
            </div>

            {isException && isExpanded && (
              <div className="mt-xs">
                {parsed['exception.message'] && (
                  <div className="text-sm text-secondary mb-xs">{parsed['exception.message']}</div>
                )}
                {parsed['exception.stacktrace'] && (
                  <pre className="sdd-stacktrace sdd-stacktrace--error">
                    {parsed['exception.stacktrace']}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}



function SelfTimeTab({ selfTimes }: { selfTimes: SpanSelfTime[] }) {
  if (selfTimes.length === 0) {
    return <div className="sdd-center sdd-empty">No self-time data available</div>;
  }
  const top20 = [...selfTimes].sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, 20);
  const maxTotal = Math.max(...top20.map((s) => s.totalDurationMs), 1);

  return (
    <div>
      <div className="flex-col gap-xs mb-md">
        {top20.map((s) => {
          const selfPct = s.totalDurationMs > 0 ? (s.selfTimeMs / s.totalDurationMs) * 100 : 0;
          const childPct = 100 - selfPct;
          const barWidth = s.totalDurationMs / maxTotal;
          return (
            <div key={s.spanId}>
              <div className="sdd-selftime__label">
                <span className="font-mono truncate">{s.operationName}</span>
                <span>{formatDuration(s.selfTimeMs)} self</span>
              </div>
              <div className="sdd-selftime__bar" style={{ width: `${barWidth * 100}%` }}>
                <div
                  className="sdd-selftime__self"
                  style={{ flex: selfPct, minWidth: selfPct > 0 ? 2 : 0 }}
                />
                <div
                  className="sdd-selftime__child"
                  style={{ flex: childPct, minWidth: childPct > 0 ? 2 : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="sdd-selftime__legend">
        <span>
          <span className="sdd-selftime__dot sdd-selftime__dot--self" />
          Self time
        </span>
        <span>
          <span className="sdd-selftime__dot sdd-selftime__dot--child" />
          Child time
        </span>
      </div>
      <div className="sdd-attr-table mt-sm">
        <div className="sdd-attr-table__header">
          <span style={{ flex: 2 }}>Operation</span>
          <span style={{ width: 70 }}>Total</span>
          <span style={{ width: 70 }}>Self</span>
          <span style={{ width: 70 }}>Children</span>
          <span style={{ width: 60 }}>Self %</span>
        </div>
        <div className="sdd-attr-table__body">
          {top20.map((s) => (
            <div key={s.spanId} className="sdd-attr-table__row">
              <span className="font-mono text-xs truncate" style={{ flex: 2 }}>
                {s.operationName}
              </span>
              <span style={{ width: 70 }}>{formatDuration(s.totalDurationMs)}</span>
              <span style={{ width: 70 }}>{formatDuration(s.selfTimeMs)}</span>
              <span style={{ width: 70 }}>{formatDuration(s.childTimeMs)}</span>
              <span style={{ width: 60 }}>
                {s.totalDurationMs > 0
                  ? `${((s.selfTimeMs / s.totalDurationMs) * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function RelatedTab({ traces }: { traces: RelatedTrace[] }) {
  const navigate = useNavigate();
  if (traces.length === 0) {
    return <div className="sdd-center sdd-empty">No related traces found</div>;
  }
  return (
    <div className="sdd-attr-table">
      <div className="sdd-attr-table__header">
        <span style={{ flex: 2 }}>Trace ID</span>
        <span style={{ width: 80 }}>Status</span>
        <span style={{ width: 90 }}>Duration</span>
        <span style={{ flex: 1 }}>Start</span>
      </div>
      <div className="sdd-attr-table__body">
        {traces.map((t) => (
          <div
            key={t.traceId}
            className="sdd-attr-table__row sdd-attr-table__row--clickable"
            onClick={() => navigate(`/traces/${t.traceId}`)}
          >
            <span className="font-mono text-xs" style={{ flex: 2, color: 'var(--color-primary)' }}>
              {t.traceId.slice(0, 16)}…
            </span>
            <span style={{ width: 80 }}>
              <Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>{t.status || 'UNSET'}</Badge>
            </span>
            <span style={{ width: 90 }}>{formatDuration(t.durationMs)}</span>
            <span style={{ flex: 1 }}>{formatTimestamp(t.startTime)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



interface Props {
  selectedSpanId: string | null;
  selectedSpan: { operation_name?: string; status?: string; duration_ms?: number } | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
  activeTab: string;
  onActiveTabChange: (nextTab: string) => void;
}

export default function SpanDetailDrawer({
  selectedSpanId,
  selectedSpan,
  spanAttributes,
  spanAttributesLoading,
  spanEvents,
  spanSelfTimes,
  relatedTraces,
  activeTab,
  onActiveTabChange,
}: Props) {
  if (!selectedSpanId) return null;

  const eventCount = spanEvents.filter((e) => e.spanId === selectedSpanId).length;

  return (
    <Surface elevation={1} padding="md" className="span-detail-drawer">
      <div className="sdd-header">
        <div>
          <div className="sdd-header__name">{selectedSpan?.operation_name || 'Span Detail'}</div>
          <div className="sdd-header__meta">
            <Badge variant={STATUS_VARIANT[selectedSpan?.status ?? ''] ?? 'default'}>
              {selectedSpan?.status || 'UNSET'}
            </Badge>
            <span className="text-xs text-muted">
              {selectedSpan?.duration_ms != null ? formatDuration(selectedSpan.duration_ms) : ''}
            </span>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={onActiveTabChange}
        variant="compact"
        size="sm"
        items={[
          { key: 'attributes', label: 'Attributes' },
          { key: 'events', label: `Events${eventCount > 0 ? ` (${eventCount})` : ''}` },
          { key: 'selftime', label: 'Self-Time' },
          {
            key: 'related',
            label: `Related${relatedTraces.length > 0 ? ` (${relatedTraces.length})` : ''}`,
          },
        ]}
      />

      <div className="sdd-tab-content">
        {activeTab === 'attributes' && (
          <AttributesTab attrs={spanAttributes} loading={spanAttributesLoading} />
        )}
        {activeTab === 'events' && (
          <EventsTab events={spanEvents} selectedSpanId={selectedSpanId} />
        )}
        {activeTab === 'selftime' && <SelfTimeTab selfTimes={spanSelfTimes} />}
        {activeTab === 'related' && <RelatedTab traces={relatedTraces} />}
      </div>
    </Surface>
  );
}
