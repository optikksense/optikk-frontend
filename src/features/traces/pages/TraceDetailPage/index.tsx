import { Badge, Button, SimpleTable, Tabs } from '@/components/ui';
import { AlertCircle, ArrowLeft, Clock, FileText, GitBranch, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Flamegraph from '@shared/components/ui/charts/specialized/Flamegraph';
import WaterfallChart from '@shared/components/ui/charts/specialized/WaterfallChart';
import StatCard from '@shared/components/ui/cards/StatCard';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import { PageShell, PageSurface } from '@shared/components/ui';

import { APP_COLORS } from '@config/colorLiterals';
import { useAppStore } from '@store/appStore';
import { formatDuration, formatNumber, formatTimestamp } from '@shared/utils/formatters';

import ServicePills from '../../components/ServicePills';
import SpanDetailDrawer from '../../components/SpanDetailDrawer';
import SpanKindBreakdown from '../../components/SpanKindBreakdown';
import { useTraceDetailData } from '../../hooks/useTraceDetailData';
import { useTraceDetailEnhanced } from '../../hooks/useTraceDetailEnhanced';
import { useTraceFlamegraph } from '../../hooks/useTraceFlamegraph';
import './TraceDetailPage.css';

export default function TraceDetailPage() {
  const { traceId } = useParams();
  const traceIdParam = traceId ?? '';
  const navigate = useNavigate();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [activeTab, setActiveTab] = useState<'timeline' | 'flamegraph'>('timeline');
  const [activeDetailTab, setActiveDetailTab] = useState('attributes');

  const {
    spans,
    traceLogs,
    traceLogsIsSpeculative,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    isLoading,
    logsLoading,
  } = useTraceDetailData(selectedTeamId, traceIdParam);

  const traceTimeBounds = useMemo(() => {
    if (spans.length === 0) {
      return { startMs: undefined, endMs: undefined };
    }

    let minStart = Infinity;
    let maxEnd = -Infinity;

    spans.forEach((span) => {
      const start = span.start_time ? new Date(span.start_time).getTime() : NaN;
      const end = span.end_time ? new Date(span.end_time).getTime() : NaN;
      if (Number.isFinite(start)) minStart = Math.min(minStart, start);
      if (Number.isFinite(end)) maxEnd = Math.max(maxEnd, end);
    });

    return {
      startMs: Number.isFinite(minStart) ? minStart : undefined,
      endMs: Number.isFinite(maxEnd) ? maxEnd : undefined,
    };
  }, [spans]);

  const {
    data: flamegraphData,
    isLoading: flamegraphLoading,
    isError: flamegraphError,
  } = useTraceFlamegraph(traceIdParam, activeTab === 'flamegraph');

  const {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanKindBreakdown,
    spanEvents,
    spanSelfTimes,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading,
  } = useTraceDetailEnhanced(
    traceIdParam,
    selectedSpanId,
    selectedSpan ?? spans[0] ?? null,
    traceTimeBounds.startMs,
    traceTimeBounds.endMs,
    activeDetailTab
  );

  const handleSpanClick = (span: { span_id?: string }) => {
    setSelectedSpanId(span.span_id ?? null);
  };

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value: unknown) => {
        try {
          if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
            return formatTimestamp(value);
          }
          return '-';
        } catch {
          return '-';
        }
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: unknown) => (
        <Badge
          color={level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : APP_COLORS.hex_73c991}
        >
          {typeof level === 'string' && level.length > 0 ? level : 'INFO'}
        </Badge>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 160,
      render: (service: unknown) =>
        typeof service === 'string' && service.length > 0 ? service : '-',
    },
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 220,
      render: (traceIdValue: unknown) => (
        <span className="font-mono text-[12px]">
          {typeof traceIdValue === 'string' && traceIdValue.length > 0 ? traceIdValue : '-'}
        </span>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: unknown) => (
        <span className="font-mono text-[12px]">
          {typeof msg === 'string' && msg.length > 0 ? msg : '-'}
        </span>
      ),
    },
  ];

  return (
    <PageShell className="trace-page-fade-in min-h-[calc(100vh-64px)]">
      <PageHeader
        title={`Trace: ${traceIdParam}`}
        icon={<GitBranch size={24} />}
        breadcrumbs={[{ label: 'Traces', path: '/traces' }, { label: traceIdParam }]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/traces')}
          >
            Back to Traces
          </Button>
        }
      />

      {isLoading ? (
        <PageSurface className="flex min-h-[320px] items-center justify-center">
          <div className="ok-spinner" />
        </PageSurface>
      ) : (
        <>
          {spans.length === 0 ? (
            <PageSurface className="space-y-3 py-10 text-center">
              <p className="text-base font-medium text-[var(--text-primary)]">
                No spans found for this trace
              </p>
              <p className="mx-auto max-w-xl text-sm text-[var(--text-secondary)]">
                {traceLogs.length > 0
                  ? 'Logs in Optik reference this trace ID, but no span rows were found. Timeline and flamegraph need ingested spans; associated logs are listed below.'
                  : 'There are no span rows for this trace ID in Optik. If you opened this from logs, span data may not be ingested yet, may have aged out, or the trace ID may not match your spans pipeline.'}
              </p>
            </PageSurface>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                  metric={{
                    title: 'Total Spans',
                    value: stats.totalSpans,
                    formatter: formatNumber,
                  }}
                  visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_5e60ce }}
                />
                <StatCard
                  metric={{ title: 'Duration', value: stats.duration, formatter: formatDuration }}
                  visuals={{ icon: <Clock size={20} />, iconColor: APP_COLORS.hex_73c991 }}
                />
                <StatCard
                  metric={{
                    title: 'Services',
                    value: stats.services.size,
                    formatter: formatNumber,
                  }}
                  visuals={{ icon: <GitBranch size={20} />, iconColor: APP_COLORS.hex_06aed5 }}
                />
                <StatCard
                  metric={{ title: 'Errors', value: stats.errors, formatter: formatNumber }}
                  visuals={{
                    icon: <AlertCircle size={20} />,
                    iconColor: stats.errors > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991,
                  }}
                />
                <StatCard
                  metric={{
                    title: 'Critical Path',
                    value: criticalPathSpanIds.size,
                    formatter: formatNumber,
                  }}
                  visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_73c991 }}
                />
                <StatCard
                  metric={{
                    title: 'Linked Logs',
                    value: traceLogs.length,
                    formatter: formatNumber,
                  }}
                  visuals={{ icon: <Clock size={20} />, iconColor: APP_COLORS.hex_06aed5 }}
                />
              </div>

              <PageSurface className="flex flex-wrap items-start gap-6">
                <div className="min-w-[240px] flex-1">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Services
                  </div>
                  <ServicePills spans={spans} activeService={null} onSelect={() => {}} />
                </div>
                {spanKindBreakdown.length > 0 ? (
                  <div className="min-w-[220px] flex-1">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Span Kind Breakdown
                    </div>
                    <SpanKindBreakdown data={spanKindBreakdown} />
                  </div>
                ) : null}
              </PageSurface>

              <PageSurface>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      Trace Visualization
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Switch between timeline and flamegraph views without leaving the trace
                      context.
                    </p>
                  </div>
                </div>

                <Tabs
                  activeKey={activeTab}
                  onChange={(nextTab) => setActiveTab(nextTab as 'timeline' | 'flamegraph')}
                  items={[
                    { key: 'timeline', label: 'Trace Timeline' },
                    { key: 'flamegraph', label: 'Flamegraph' },
                  ]}
                  size="lg"
                  className="mb-4 mt-4"
                />

                {activeTab === 'timeline' ? (
                  <WaterfallChart
                    spans={spans}
                    onSpanClick={handleSpanClick}
                    selectedSpanId={selectedSpanId}
                    criticalPathSpanIds={criticalPathSpanIds}
                    errorPathSpanIds={errorPathSpanIds}
                  />
                ) : flamegraphLoading ? (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="ok-spinner" />
                  </div>
                ) : flamegraphError ? (
                  <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                    Could not load flamegraph data for this trace.
                  </div>
                ) : flamegraphData ? (
                  <Flamegraph data={flamegraphData} />
                ) : (
                  <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                    No flamegraph data available for this trace.
                  </div>
                )}
              </PageSurface>

              <SpanDetailDrawer
                selectedSpanId={selectedSpanId}
                selectedSpan={selectedSpan ?? null}
                spanAttributes={spanAttributes}
                spanAttributesLoading={spanAttributesLoading}
                spanEvents={spanEvents}
                spanSelfTimes={spanSelfTimes}
                relatedTraces={relatedTraces}
                activeTab={activeDetailTab}
                onActiveTabChange={setActiveDetailTab}
              />
            </>
          )}

          <PageSurface className="space-y-4">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
              <FileText size={18} />
              <span>Associated Logs</span>
              {traceLogs.length > 0 ? (
                <Badge
                  color="default"
                  style={{
                    marginLeft: 8,
                    background: APP_COLORS.rgba_255_255_255_0p06_2,
                    border: 'none',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {traceLogs.length} events
                </Badge>
              ) : null}
              {traceLogs.length > 0 ? (
                <Badge variant={traceLogsIsSpeculative ? 'warning' : 'success'}>
                  {traceLogsIsSpeculative ? 'Heuristic correlation' : 'Exact trace correlation'}
                </Badge>
              ) : null}
            </div>
            {traceLogsIsSpeculative ? (
              <p className="text-sm text-[var(--text-secondary)]">
                These logs were matched from surrounding service and time context because an exact
                trace-linked set was not available.
              </p>
            ) : null}

            {logsLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <div className="ok-spinner" />
              </div>
            ) : traceLogs.length === 0 ? (
              <div className="py-8 text-center text-[var(--text-muted)]">
                No logs associated with this trace
              </div>
            ) : (
              <SimpleTable
                columns={logColumns}
                dataSource={traceLogs}
                rowKey={(row: any, index?: number) =>
                  `${row.timestamp}-${row.service_name}-${index}`
                }
                size="small"
                pagination={false}
                scroll={{ y: 300 }}
                className="glass-table"
              />
            )}
          </PageSurface>
        </>
      )}
    </PageShell>
  );
}
