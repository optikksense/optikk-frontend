import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Spin, Empty, Tag, Table } from 'antd';
import { GitBranch, Layers, Clock, AlertCircle, ArrowLeft, FileText, X, ChevronDown, ChevronRight } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { formatDuration, formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/layout/PageHeader';
import StatCard from '@components/common/cards/StatCard';
import { ObservabilityDetailPanel } from '@components/common';
import WaterfallChart from '@components/charts/specialized/WaterfallChart';
import './TraceDetailPage.css';

const parseAttributes = (attributes) => {
  if (!attributes) return {};
  if (typeof attributes === 'object') return attributes;
  if (typeof attributes !== 'string') return {};

  try {
    const parsed = JSON.parse(attributes);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return { raw: attributes };
  }
};

const normalizeSpan = (span = {}) => ({
  ...span,
  span_id: span.span_id ?? span.spanId ?? '',
  parent_span_id: span.parent_span_id ?? span.parentSpanId ?? '',
  trace_id: span.trace_id ?? span.traceId ?? '',
  operation_name: span.operation_name ?? span.operationName ?? '',
  service_name: span.service_name ?? span.serviceName ?? '',
  span_kind: span.span_kind ?? span.spanKind ?? '',
  start_time: span.start_time ?? span.startTime ?? '',
  end_time: span.end_time ?? span.endTime ?? '',
  duration_ms: Number(span.duration_ms ?? span.durationMs ?? 0),
  status: span.status ?? 'UNSET',
  status_message: span.status_message ?? span.statusMessage ?? '',
  http_method: span.http_method ?? span.httpMethod ?? '',
  http_url: span.http_url ?? span.httpUrl ?? '',
  http_status_code: Number(span.http_status_code ?? span.httpStatusCode ?? 0),
  attributes: parseAttributes(span.attributes),
});

const normalizeTraceLog = (log = {}) => ({
  ...log,
  timestamp: log.timestamp ?? '',
  level: log.level ?? 'INFO',
  service_name: log.service_name ?? log.serviceName ?? '',
  message: log.message ?? '',
  trace_id: log.trace_id ?? log.traceId ?? '',
  span_id: log.span_id ?? log.spanId ?? '',
});

export default function TraceDetailPage() {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [selectedSpanId, setSelectedSpanId] = useState(() => searchParams.get('span') || null);
  const [waterfallCollapsed, setWaterfallCollapsed] = useState(false);

  // Sync span from URL on mount (in case component was already mounted)
  useEffect(() => {
    const spanFromUrl = searchParams.get('span');
    if (spanFromUrl) setSelectedSpanId(spanFromUrl);
  }, []);

  // Fetch spans by root span_id (the URL parameter is a span_id from the traces list).
  // Falls back to fetching by trace_id (e.g., when navigating here from a log's traceId).
  const { data: spansData, isLoading } = useQuery({
    queryKey: ['span-tree', selectedTeamId, traceId],
    queryFn: async () => {
      const bySpan = await v1Service.getSpanTree(selectedTeamId, traceId);
      if (Array.isArray(bySpan) && bySpan.length > 0) return bySpan;
      // Fallback: treat the id as a trace_id (e.g. navigated from logs)
      return v1Service.getTraceSpans(selectedTeamId, traceId);
    },
    enabled: !!selectedTeamId && !!traceId,
  });

  const spans = useMemo(
    () => (Array.isArray(spansData) ? spansData : []).map(normalizeSpan),
    [spansData]
  );

  // Resolve the actual trace_id from loaded spans (URL param may be a root span_id).
  const resolvedTraceId = spans.length > 0 ? (spans[0].trace_id || traceId) : traceId;

  // Fetch logs associated with this trace, keyed by the resolved trace_id.
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['trace-logs', selectedTeamId, resolvedTraceId],
    queryFn: () => v1Service.getTraceLogs(selectedTeamId, resolvedTraceId),
    enabled: !!selectedTeamId && !!resolvedTraceId,
  });
  const traceLogs = useMemo(
    () => (Array.isArray(logsData) ? logsData : []).map(normalizeTraceLog),
    [logsData]
  );
  const selectedSpan = spans.find(s => s.span_id === selectedSpanId);

  // Calculate trace statistics
  const stats = {
    totalSpans: spans.length,
    duration: 0,
    services: new Set(),
    errors: 0,
  };

  if (spans.length > 0) {
    const startTimes = spans.map(s => new Date(s.start_time).getTime());
    const endTimes = spans.map(s => new Date(s.end_time).getTime());
    const spanEnvelopeDuration = Math.max(...endTimes) - Math.min(...startTimes);
    const rootSpan = [...spans]
      .filter((s) => !s.parent_span_id)
      .sort((a, b) => Number(b.duration_ms || 0) - Number(a.duration_ms || 0))[0];
    const rootDuration = Number(rootSpan?.duration_ms || 0);
    // Keep detail duration aligned with trace-list duration (root span) when available.
    stats.duration = rootDuration > 0 ? rootDuration : spanEnvelopeDuration;

    spans.forEach(span => {
      stats.services.add(span.service_name);
      if (span.status === 'ERROR') {
        stats.errors++;
      }
    });
  }

  const handleSpanClick = (span) => {
    setSelectedSpanId(span.span_id);
  };

  const handleCloseDrawer = () => {
    setSelectedSpanId(null);
  };

  const handleBackClick = () => {
    navigate('/traces');
  };

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value) => {
        try {
          return formatTimestamp(value);
        } catch (e) {
          return '-';
        }
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level) => (
        <Tag color={level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : '#73C991'}>
          {level || 'INFO'}
        </Tag>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 160,
      render: (service) => service || '-',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {msg || '-'}
        </span>
      ),
    },
  ];

  // Build fields for the detail panel
  const spanDetailFields = selectedSpan ? [
    { key: 'span_id', label: 'Span ID', value: selectedSpan.span_id },
    { key: 'parent_span_id', label: 'Parent Span ID', value: selectedSpan.parent_span_id || '—' },
    { key: 'service_name', label: 'Service', value: selectedSpan.service_name, filterable: true },
    { key: 'span_kind', label: 'Span Kind', value: selectedSpan.span_kind },
    { key: 'status', label: 'Status', value: selectedSpan.status || 'UNSET' },
    ...(selectedSpan.status_message ? [{ key: 'status_message', label: 'Status Message', value: selectedSpan.status_message }] : []),
    { key: 'start_time', label: 'Start Time', value: formatTimestamp(selectedSpan.start_time) },
    { key: 'end_time', label: 'End Time', value: formatTimestamp(selectedSpan.end_time) },
    { key: 'duration', label: 'Duration', value: formatDuration(selectedSpan.duration_ms) },
    { key: 'trace_id', label: 'Trace ID', value: selectedSpan.trace_id },
    ...(selectedSpan.http_method ? [
      { key: 'http_method', label: 'HTTP Method', value: selectedSpan.http_method },
      { key: 'http_url', label: 'HTTP URL', value: selectedSpan.http_url },
      { key: 'http_status_code', label: 'HTTP Status', value: String(selectedSpan.http_status_code) },
    ] : []),
    ...(selectedSpan.host ? [{ key: 'host', label: 'Host', value: selectedSpan.host }] : []),
    ...(selectedSpan.pod ? [{ key: 'pod', label: 'Pod', value: selectedSpan.pod }] : []),
  ].filter((f) => f.value && f.value !== '0') : [];

  return (
    <div className="trace-detail-page">
      <PageHeader
        title={`Trace: ${traceId}`}
        icon={<GitBranch size={24} />}
        breadcrumbs={[
          { label: 'Traces', path: '/traces' },
          { label: traceId },
        ]}
        actions={
          <button className="trace-detail-back-btn" onClick={handleBackClick}>
            <ArrowLeft size={16} />
            Back to Traces
          </button>
        }
      />

      {selectedSpan && (
        <ObservabilityDetailPanel
          title="Span Detail"
          titleBadge={
            <Tag
              color={selectedSpan.status === 'ERROR' ? 'red' : selectedSpan.status === 'OK' ? 'green' : 'default'}
              style={{ marginLeft: 8, fontSize: 11 }}
            >
              {selectedSpan.status || 'UNSET'}
            </Tag>
          }
          metaLine={selectedSpan.operation_name}
          metaRight={formatDuration(selectedSpan.duration_ms)}
          fields={spanDetailFields}
          rawData={selectedSpan}
          onClose={handleCloseDrawer}
        />
      )}

      {isLoading ? (
        <div className="trace-detail-loading">
          <Spin size="large" />
        </div>
      ) : spans.length === 0 ? (
        <Empty description="No spans found for this trace" />
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Spans"
                value={stats.totalSpans}
                icon={<Layers size={20} />}
                iconColor="#5E60CE"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Duration"
                value={stats.duration}
                formatter={(val) => formatDuration(val)}
                icon={<Clock size={20} />}
                iconColor="#73C991"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Services"
                value={stats.services.size}
                icon={<GitBranch size={20} />}
                iconColor="#06AED5"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Errors"
                value={stats.errors}
                icon={<AlertCircle size={20} />}
                iconColor={stats.errors > 0 ? '#F04438' : '#73C991'}
              />
            </Col>
          </Row>

          {/* Waterfall Chart */}
          <Card
            title={
              <span
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={() => setWaterfallCollapsed((c) => !c)}
              >
                {waterfallCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                Trace Timeline
              </span>
            }
            className="trace-detail-card"
            styles={{ body: { padding: waterfallCollapsed ? 0 : '8px' } }}
            extra={
              <button
                onClick={() => setWaterfallCollapsed((c) => !c)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #666)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={waterfallCollapsed ? 'Expand waterfall' : 'Collapse waterfall'}
              >
                <X size={16} />
              </button>
            }
          >
            {!waterfallCollapsed && (
              <WaterfallChart
                spans={spans}
                onSpanClick={handleSpanClick}
                selectedSpanId={selectedSpanId}
              />
            )}
          </Card>

          {/* Associated Logs */}
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} />
                <span>Associated Logs</span>
                {traceLogs.length > 0 && (
                  <Tag color="default" style={{ marginLeft: 8 }}>
                    {traceLogs.length} events
                  </Tag>
                )}
              </span>
            }
            className="trace-detail-card"
            style={{ marginTop: 24 }}
          >
            {logsLoading ? (
              <div className="trace-detail-loading">
                <Spin size="large" />
              </div>
            ) : traceLogs.length === 0 ? (
              <Empty description="No logs associated with this trace in the selected time range" />
            ) : (
              <Table
                columns={logColumns}
                dataSource={traceLogs}
                rowKey={(row, index) => `${row.timestamp}-${row.service_name}-${index}`}
                size="small"
                pagination={false}
                scroll={{ y: 260 }}
              />
            )}
          </Card>

          {/* Span Detail Panel */}
        </>
      )}
    </div>
  );
}
