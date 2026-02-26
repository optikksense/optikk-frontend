import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Spin, Empty, Tag, Table } from 'antd';
import { GitBranch, Layers, Clock, AlertCircle, ArrowLeft, FileText, X, ChevronDown, ChevronRight } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { formatDuration, formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/PageHeader';
import StatCard from '@components/common/StatCard';
import DetailDrawer from '@components/common/DetailDrawer';
import WaterfallChart from '@components/charts/WaterfallChart';
import './TraceDetailPage.css';

export default function TraceDetailPage() {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [selectedSpanId, setSelectedSpanId] = useState(null);
  const [waterfallCollapsed, setWaterfallCollapsed] = useState(false);

  // Fetch trace spans
  const { data: spansData, isLoading } = useQuery({
    queryKey: ['trace-spans', selectedTeamId, traceId],
    queryFn: () => v1Service.getTraceSpans(selectedTeamId, traceId),
    enabled: !!selectedTeamId && !!traceId,
  });

  // Fetch logs associated with this trace
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['trace-logs', selectedTeamId, traceId],
    queryFn: () => v1Service.getTraceLogs(selectedTeamId, traceId),
    enabled: !!selectedTeamId && !!traceId,
  });

  const spans = spansData || [];
  const traceLogs = logsData || [];
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
    stats.duration = Math.max(...endTimes) - Math.min(...startTimes);

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

  // Define drawer sections for span detail
  const drawerSections = selectedSpan ? [
    {
      title: 'Span Info',
      fields: [
        { label: 'Span ID', key: 'span_id' },
        { label: 'Parent Span ID', key: 'parent_span_id', render: (val) => val || '-' },
        { label: 'Operation', key: 'operation_name' },
        { label: 'Service', key: 'service_name' },
        { label: 'Span Kind', key: 'span_kind' },
        { label: 'Duration', key: 'duration_ms', render: (val) => formatDuration(val) },
        {
          label: 'Status',
          key: 'status',
          render: (val) => (
            <Tag color={val === 'ERROR' ? 'red' : val === 'OK' ? 'green' : 'default'}>
              {val || 'UNSET'}
            </Tag>
          )
        },
        { label: 'Status Message', key: 'status_message', render: (val) => val || '-' },
        { label: 'Start Time', key: 'start_time', render: (val) => formatTimestamp(val) },
        { label: 'End Time', key: 'end_time', render: (val) => formatTimestamp(val) },
      ],
    },
    ...(selectedSpan.http_method ? [{
      title: 'HTTP',
      fields: [
        { label: 'Method', key: 'http_method' },
        { label: 'URL', key: 'http_url' },
        { label: 'Status Code', key: 'http_status_code' },
      ],
    }] : []),
    {
      title: 'Infrastructure',
      fields: [
        { label: 'Host', key: 'host', render: (val) => val || '-' },
        { label: 'Pod', key: 'pod', render: (val) => val || '-' },
      ],
    },
    ...(selectedSpan.attributes && Object.keys(selectedSpan.attributes).length > 0 ? [{
      title: 'Attributes',
      fields: [
        {
          label: 'Raw JSON',
          key: 'attributes',
          render: (val) => (
            <pre className="trace-detail-json">
              {JSON.stringify(val, null, 2)}
            </pre>
          )
        },
      ],
    }] : []),
  ] : [];

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

          {/* Span Detail Drawer */}
          <DetailDrawer
            open={!!selectedSpanId}
            onClose={handleCloseDrawer}
            title={selectedSpan?.operation_name || 'Span Details'}
            width={720}
            sections={drawerSections}
            data={selectedSpan}
          />
        </>
      )}
    </div>
  );
}
