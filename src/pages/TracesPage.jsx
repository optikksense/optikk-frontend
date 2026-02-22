import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Button, Card, Row, Col, Tooltip, Switch } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { GitBranch, Download, AlertCircle, Clock, Activity } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { PageHeader, FilterBar, DataTable, StatusBadge, StatCard, StatCardsGrid } from '@components/common';
import { TRACE_STATUSES } from '@config/constants';
import { formatTimestamp, formatDuration, formatNumber } from '@utils/formatters';
import LatencyHistogram from '@components/charts/LatencyHistogram';

export default function TracesPage() {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [minDuration, setMinDuration] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useQuery({
    queryKey: ['traces-v2', selectedTeamId, timeRange.value, page, pageSize, selectedStatus, selectedService, minDuration, errorsOnly, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      const statusFilter = errorsOnly ? 'ERROR' : selectedStatus;

      return v1Service.getTraces(selectedTeamId, startTime, endTime, {
        status: statusFilter || undefined,
        services: selectedService ? [selectedService] : undefined,
        minDuration: minDuration || undefined,
        limit: pageSize,
        offset,
      });
    },
    enabled: !!selectedTeamId,
  });

  const traces = data?.traces || [];
  const total = data?.total || 0;
  const summary = data?.summary || {};
  const totalTraces = summary.total_traces ?? total ?? traces.length;
  const errorTraces = summary.error_traces ?? 0;
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;

  const handleTraceClick = (traceId) => {
    navigate(`/traces/${traceId}`);
  };

  // Service breakdown for badge row
  const serviceBadges = useMemo(() => {
    const counts = {};
    traces.forEach((t) => {
      if (t.service_name) {
        counts[t.service_name] = (counts[t.service_name] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [traces]);

  const columns = [
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 200,
      render: (traceId) => (
        <code
          style={{ fontSize: 11, cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}
          onClick={() => handleTraceClick(traceId)}
        >
          {traceId}
        </code>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 150,
      render: (name) => <Tag>{name}</Tag>,
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 220,
      render: (op, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{op}</span>
          {record.http_status_code && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {record.http_method && (
                <Tag size="small" color={record.http_status_code >= 500 ? 'red' : record.http_status_code >= 400 ? 'orange' : 'blue'}>
                  {record.http_method}
                </Tag>
              )}
              <span style={{ marginLeft: record.http_method ? 4 : 0 }}>
                HTTP {record.http_status_code}
              </span>
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => <StatusBadge type="trace" status={status} />,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 130,
      render: (duration) => {
        const color = duration > 1000 ? '#F04438' : duration > 500 ? '#F79009' : 'var(--text-primary)';
        return (
          <span style={{ color, fontWeight: duration > 500 ? 600 : 400 }}>
            {formatDuration(duration)}
          </span>
        );
      },
      sorter: true,
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 190,
      render: (timestamp) => formatTimestamp(timestamp),
    },
  ];

  const statusOptions = (TRACE_STATUSES || []).map((s) => ({
    label: s.label,
    value: s.value,
  }));

  const durationOptions = [
    { label: '100ms+', value: 100 },
    { label: '500ms+', value: 500 },
    { label: '1s+', value: 1000 },
    { label: '5s+', value: 5000 },
    { label: '10s+', value: 10000 },
  ];

  const serviceOptions = traces.length > 0
    ? [...new Set(traces.map(trace => trace.service_name))].filter(Boolean).map(service => ({ label: service, value: service }))
    : [];

  return (
    <div>
      <PageHeader title="Traces" icon={<GitBranch size={24} />} />

      {/* Trace Summary Stat Cards */}
      <StatCardsGrid
        style={{ marginBottom: 16 }}
        stats={[
          { title: "Total Traces", value: totalTraces, formatter: (val) => formatNumber(val || 0), icon: <Activity size={20} />, iconColor: "#3B82F6" },
          { title: "Error Rate", value: errorRate, formatter: (val) => `${(val || 0).toFixed(2)}%`, icon: <AlertCircle size={20} />, iconColor: "#F04438" },
          { title: "P95 Duration", value: summary.p95_duration || 0, formatter: (val) => formatDuration(val || 0), icon: <Clock size={20} />, iconColor: "#10B981" },
          { title: "P99 Duration", value: summary.p99_duration || 0, formatter: (val) => formatDuration(val || 0), icon: <Clock size={20} />, iconColor: "#F59E0B" }
        ]}
      />

      {/* Latency Histogram */}
      {traces.length > 0 && (
        <Card style={{ marginBottom: 16 }} className="chart-card" styles={{ body: { padding: '8px' } }}>
          <LatencyHistogram traces={traces} height={120} />
        </Card>
      )}

      {/* Service Breakdown Badges */}
      {serviceBadges.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag
            style={{ cursor: 'pointer' }}
            color={!selectedService ? 'blue' : 'default'}
            onClick={() => setSelectedService(null)}
          >
            All ({total || traces.length})
          </Tag>
          {serviceBadges.map(([service, count]) => (
            <Tag
              key={service}
              style={{ cursor: 'pointer' }}
              color={selectedService === service ? 'blue' : 'default'}
              onClick={() => setSelectedService(selectedService === service ? null : service)}
            >
              {service} ({count})
            </Tag>
          ))}
        </div>
      )}

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'status',
            placeholder: 'Filter by status',
            options: statusOptions,
            value: selectedStatus,
            onChange: setSelectedStatus,
          },
          {
            type: 'select',
            key: 'service',
            placeholder: 'Filter by service',
            options: serviceOptions,
            value: selectedService,
            onChange: setSelectedService,
          },
          {
            type: 'select',
            key: 'minDuration',
            placeholder: 'Min duration',
            options: durationOptions,
            value: minDuration,
            onChange: setMinDuration,
          },
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tooltip title="Show only traces with errors">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} style={{ color: errorsOnly ? '#F04438' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, color: errorsOnly ? '#F04438' : 'var(--text-muted)' }}>Errors only</span>
                <Switch size="small" checked={errorsOnly} onChange={setErrorsOnly} />
              </div>
            </Tooltip>
            <Button icon={<Download size={16} />}>Export</Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={traces}
        loading={isLoading}
        rowKey="trace_id"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
      />
    </div>
  );
}
