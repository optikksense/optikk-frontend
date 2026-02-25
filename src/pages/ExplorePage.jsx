import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { Activity, FileText, GitBranch, Play, Radio, Save, Search, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { exploreService } from '@services/exploreService';
import { LOG_LEVELS } from '@config/constants';
import { formatDuration, formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/PageHeader';
import './ExplorePage.css';

const DEFAULT_LOGS_QUERY = {
  levels: [],
  service: '',
  message: '',
  limit: 100,
  liveTail: false,
};

const DEFAULT_METRICS_QUERY = {
  operation: 'ratio',
  metricA: 'error_count',
  metricB: 'request_count',
  service: '',
};

const DEFAULT_TRACES_QUERY = {
  expression: 'http.status_code=500 AND service=cart AND duration>1s',
  limit: 50,
};

const METRIC_OPTIONS = [
  { label: 'Request Count', value: 'request_count' },
  { label: 'Error Count', value: 'error_count' },
  { label: 'Average Latency (ms)', value: 'avg_latency' },
  { label: 'P50 Latency (ms)', value: 'p50' },
  { label: 'P95 Latency (ms)', value: 'p95' },
  { label: 'P99 Latency (ms)', value: 'p99' },
];

const TRACE_CONDITION_REGEX = /([a-zA-Z0-9._-]+)\s*(=|!=|>=|<=|>|<)\s*("[^"]+"|'[^']+'|[^\s]+)/g;

function resolveTimeRange(timeRange) {
  if (timeRange?.value === 'custom' && timeRange.startTime && timeRange.endTime) {
    return { startTime: timeRange.startTime, endTime: timeRange.endTime };
  }
  const endTime = Date.now();
  const minutes = Number(timeRange?.minutes || 60);
  return { startTime: endTime - minutes * 60 * 1000, endTime };
}

function stripQuotes(value) {
  const trimmed = String(value || '').trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseDurationLiteral(raw) {
  const value = stripQuotes(raw).toLowerCase();
  const match = value.match(/^([0-9]+(?:\.[0-9]+)?)(ms|s|m)?$/);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2] || 'ms';
  if (!Number.isFinite(amount)) return null;
  if (unit === 'ms') return Math.round(amount);
  if (unit === 's') return Math.round(amount * 1000);
  if (unit === 'm') return Math.round(amount * 60 * 1000);
  return null;
}

function parseTraceExpression(expression) {
  const input = String(expression || '').trim();
  if (!input) {
    return { params: {}, conditions: [] };
  }

  const conditions = [];
  let match;
  while ((match = TRACE_CONDITION_REGEX.exec(input)) !== null) {
    conditions.push({
      key: match[1].toLowerCase(),
      operator: match[2],
      value: stripQuotes(match[3]),
    });
  }

  if (conditions.length === 0) {
    return {
      error: 'No valid conditions found. Example: http.status_code=500 AND service=cart AND duration>1s',
      params: {},
      conditions: [],
    };
  }

  const leftover = input.replace(TRACE_CONDITION_REGEX, ' ').replace(/\bAND\b/gi, ' ').trim();
  if (leftover) {
    return { error: `Unsupported syntax near: ${leftover}`, params: {}, conditions: [] };
  }

  const params = {};
  let service;
  let status;
  let operation;
  let traceId;
  let httpStatusCode;
  let minDuration;
  let maxDuration;

  for (const condition of conditions) {
    const { key, operator, value } = condition;
    switch (key) {
      case 'service':
      case 'service_name':
        if (operator !== '=') {
          return { error: 'Only "=" is supported for service filters', params: {}, conditions: [] };
        }
        service = value;
        break;
      case 'status':
        if (operator !== '=') {
          return { error: 'Only "=" is supported for status filters', params: {}, conditions: [] };
        }
        status = value.toUpperCase();
        break;
      case 'operation':
      case 'operation_name':
        if (operator !== '=') {
          return { error: 'Only "=" is supported for operation filters', params: {}, conditions: [] };
        }
        operation = value;
        break;
      case 'trace_id':
      case 'trace.id':
        if (operator !== '=') {
          return { error: 'Only "=" is supported for trace_id filters', params: {}, conditions: [] };
        }
        traceId = value;
        break;
      case 'http.status_code':
      case 'http_status_code':
      case 'status_code': {
        if (operator !== '=') {
          return { error: 'Only "=" is supported for http.status_code filters', params: {}, conditions: [] };
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
          return { error: `Invalid http.status_code value: ${value}`, params: {}, conditions: [] };
        }
        httpStatusCode = String(Math.round(parsed));
        break;
      }
      case 'duration':
      case 'duration_ms': {
        const durationMs = parseDurationLiteral(value);
        if (!Number.isFinite(durationMs)) {
          return { error: `Invalid duration value: ${value}`, params: {}, conditions: [] };
        }
        if (operator === '>' || operator === '>=') minDuration = String(durationMs);
        if (operator === '<' || operator === '<=') maxDuration = String(durationMs);
        if (operator === '=') {
          minDuration = String(durationMs);
          maxDuration = String(durationMs);
        }
        if (operator === '!=') {
          return { error: 'Operator "!=" is not supported for duration', params: {}, conditions: [] };
        }
        break;
      }
      default:
        return { error: `Unsupported trace key: ${key}`, params: {}, conditions: [] };
    }
  }

  if (service) params.services = [service];
  if (status) params.status = status;
  if (operation) params.operationName = operation;
  if (traceId) params.traceId = traceId;
  if (httpStatusCode) params.httpStatusCode = httpStatusCode;
  if (minDuration) params.minDuration = minDuration;
  if (maxDuration) params.maxDuration = maxDuration;

  return { params, conditions };
}

function buildLogsExpression(query) {
  const clauses = [];
  if (query.levels?.length) clauses.push(`severity in (${query.levels.join(',')})`);
  if (query.service) clauses.push(`service="${query.service}"`);
  if (query.message) clauses.push(`message~"${query.message}"`);
  if (!clauses.length) return 'all logs in selected time range';
  return clauses.join(' AND ');
}

function buildMetricsExpression(query) {
  if (query.operation === 'rate') {
    return `rate(${query.metricA})`;
  }
  if (query.operation === 'ratio') {
    return `ratio(${query.metricA}, ${query.metricB})`;
  }
  return `delta(${query.metricA}, ${query.metricB})`;
}

function evaluateMetricsExpression(rows, query) {
  const series = [...(Array.isArray(rows) ? rows : [])]
    .map((row) => ({
      timestamp: row.timestamp || row.time_bucket,
      values: {
        request_count: Number(row.request_count || 0),
        error_count: Number(row.error_count || 0),
        avg_latency: Number(row.avg_latency || 0),
        p50: Number(row.p50 || 0),
        p95: Number(row.p95 || 0),
        p99: Number(row.p99 || 0),
      },
    }))
    .filter((row) => row.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return series.map((point, index) => {
    const a = point.values[query.metricA] ?? 0;
    const b = point.values[query.metricB] ?? 0;
    if (query.operation === 'ratio') {
      return { timestamp: point.timestamp, value: b === 0 ? 0 : a / b };
    }
    if (query.operation === 'delta') {
      return { timestamp: point.timestamp, value: a - b };
    }
    if (index === 0) {
      return { timestamp: point.timestamp, value: null };
    }
    const prev = series[index - 1];
    const prevValue = prev.values[query.metricA] ?? 0;
    const elapsedSec = Math.max(1, (new Date(point.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000);
    return { timestamp: point.timestamp, value: (a - prevValue) / elapsedSec };
  });
}

function normalizeSavedQueryPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (typeof payload.raw === 'string') {
    try {
      return JSON.parse(payload.raw);
    } catch {
      return {};
    }
  }
  return payload;
}

export default function ExplorePage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [activeTab, setActiveTab] = useState('logs');

  const [logsBuilder, setLogsBuilder] = useState(DEFAULT_LOGS_QUERY);
  const [logsQuery, setLogsQuery] = useState(DEFAULT_LOGS_QUERY);

  const [metricsBuilder, setMetricsBuilder] = useState(DEFAULT_METRICS_QUERY);
  const [metricsQuery, setMetricsQuery] = useState(DEFAULT_METRICS_QUERY);

  const [tracesBuilder, setTracesBuilder] = useState(DEFAULT_TRACES_QUERY);
  const [tracesQuery, setTracesQuery] = useState(DEFAULT_TRACES_QUERY);

  const [savedTypeFilter, setSavedTypeFilter] = useState('all');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveForm] = Form.useForm();
  const [savePending, setSavePending] = useState(null);
  const [savingQuery, setSavingQuery] = useState(false);

  const traceParsed = useMemo(() => parseTraceExpression(tracesQuery.expression), [tracesQuery.expression]);
  const metricsExpression = useMemo(() => buildMetricsExpression(metricsQuery), [metricsQuery]);
  const logsExpression = useMemo(() => buildLogsExpression(logsQuery), [logsQuery]);

  const { data: serviceMetricsRows } = useQuery({
    queryKey: ['explore-service-options', selectedTeamId, timeRange.value, timeRange.startTime, timeRange.endTime, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeRange(timeRange);
      return v1Service.getServiceMetrics(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
  });

  const serviceOptions = useMemo(() => {
    const rows = Array.isArray(serviceMetricsRows) ? serviceMetricsRows : [];
    return rows
      .map((row) => row.service_name)
      .filter(Boolean)
      .map((name) => ({ label: name, value: name }));
  }, [serviceMetricsRows]);

  const { data: logsData, isFetching: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['explore-logs', selectedTeamId, timeRange.value, timeRange.startTime, timeRange.endTime, refreshKey, logsQuery],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeRange(timeRange);
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        levels: logsQuery.levels?.length ? logsQuery.levels : undefined,
        services: logsQuery.service ? [logsQuery.service] : undefined,
        search: logsQuery.message || undefined,
        limit: logsQuery.limit || 100,
        direction: 'desc',
      });
    },
    enabled: !!selectedTeamId,
    refetchInterval: logsQuery.liveTail ? 2500 : false,
  });

  const { data: metricsRows, isFetching: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['explore-metrics', selectedTeamId, timeRange.value, timeRange.startTime, timeRange.endTime, refreshKey, metricsQuery],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeRange(timeRange);
      return v1Service.getMetricsTimeSeries(
        selectedTeamId,
        startTime,
        endTime,
        metricsQuery.service || undefined,
        '1m'
      );
    },
    enabled: !!selectedTeamId,
  });

  const { data: tracesData, isFetching: tracesLoading, refetch: refetchTraces } = useQuery({
    queryKey: ['explore-traces', selectedTeamId, timeRange.value, timeRange.startTime, timeRange.endTime, refreshKey, tracesQuery],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeRange(timeRange);
      return v1Service.getTraces(selectedTeamId, startTime, endTime, {
        ...traceParsed.params,
        limit: tracesQuery.limit || 50,
        offset: 0,
      });
    },
    enabled: !!selectedTeamId && !traceParsed.error,
  });

  const { data: savedQueriesResponse, isFetching: savedQueriesLoading, refetch: refetchSavedQueries } = useQuery({
    queryKey: ['explore-saved-queries', selectedTeamId, refreshKey, savedTypeFilter],
    queryFn: () => exploreService.listSavedQueries(selectedTeamId, savedTypeFilter === 'all' ? undefined : savedTypeFilter),
    enabled: !!selectedTeamId,
  });

  const savedQueries = savedQueriesResponse?.savedQueries || [];
  const logsRows = logsData?.logs || [];
  const tracesRows = tracesData?.traces || [];

  const metricsSeries = useMemo(
    () => evaluateMetricsExpression(metricsRows, metricsQuery).filter((point) => point.value !== null && Number.isFinite(point.value)),
    [metricsRows, metricsQuery]
  );

  const metricLineData = useMemo(() => ({
    labels: metricsSeries.map((point) => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: metricsExpression,
        data: metricsSeries.map((point) => Number(point.value.toFixed(6))),
        borderColor: '#06AED5',
        backgroundColor: 'rgba(6, 174, 213, 0.2)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
        fill: true,
      },
    ],
  }), [metricsSeries, metricsExpression]);

  const metricLineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
    },
  }), []);

  const latestMetricValue = metricsSeries.length ? metricsSeries[metricsSeries.length - 1].value : 0;

  const runLogsQuery = useCallback(() => {
    setLogsQuery({
      ...logsBuilder,
      limit: Math.min(500, Math.max(10, Number(logsBuilder.limit) || 100)),
    });
  }, [logsBuilder]);

  const runMetricsQuery = useCallback(() => {
    setMetricsQuery({ ...metricsBuilder });
  }, [metricsBuilder]);

  const runTracesQuery = useCallback(() => {
    setTracesQuery({
      ...tracesBuilder,
      limit: Math.min(200, Math.max(10, Number(tracesBuilder.limit) || 50)),
    });
  }, [tracesBuilder]);

  const openSaveModal = useCallback(() => {
    let nextPending = null;
    let defaultName = 'Saved Query';

    if (activeTab === 'logs') {
      nextPending = {
        queryType: 'logs',
        query: { ...logsQuery, queryText: logsExpression },
      };
      defaultName = `Logs: ${logsExpression.slice(0, 48)}`;
    } else if (activeTab === 'metrics') {
      nextPending = {
        queryType: 'metrics',
        query: { ...metricsQuery, queryText: metricsExpression },
      };
      defaultName = `Metrics: ${metricsExpression}`;
    } else {
      nextPending = {
        queryType: 'traces',
        query: { ...tracesQuery, queryText: tracesQuery.expression },
      };
      defaultName = `Traces: ${tracesQuery.expression.slice(0, 48)}`;
    }

    setSavePending(nextPending);
    saveForm.setFieldsValue({ name: defaultName, description: '' });
    setIsSaveModalOpen(true);
  }, [activeTab, logsExpression, logsQuery, metricsExpression, metricsQuery, tracesQuery, saveForm]);

  const saveCurrentQuery = useCallback(async () => {
    if (!savePending) return;
    let values;
    try {
      values = await saveForm.validateFields();
    } catch {
      return;
    }
    setSavingQuery(true);
    try {
      await exploreService.createSavedQuery(selectedTeamId, {
        queryType: savePending.queryType,
        name: String(values.name || '').trim(),
        description: String(values.description || '').trim(),
        query: savePending.query,
      });
      toast.success('Saved query created');
      setIsSaveModalOpen(false);
      setSavePending(null);
      saveForm.resetFields();
      refetchSavedQueries();
    } catch (error) {
      toast.error(error?.message || 'Failed to save query');
    } finally {
      setSavingQuery(false);
    }
  }, [savePending, saveForm, selectedTeamId, refetchSavedQueries]);

  const runSavedQuery = useCallback((item) => {
    const payload = normalizeSavedQueryPayload(item.query);
    if (item.queryType === 'logs') {
      const next = { ...DEFAULT_LOGS_QUERY, ...payload };
      setActiveTab('logs');
      setLogsBuilder(next);
      setLogsQuery(next);
      return;
    }
    if (item.queryType === 'metrics') {
      const next = { ...DEFAULT_METRICS_QUERY, ...payload };
      setActiveTab('metrics');
      setMetricsBuilder(next);
      setMetricsQuery(next);
      return;
    }
    const next = { ...DEFAULT_TRACES_QUERY, ...payload };
    setActiveTab('traces');
    setTracesBuilder(next);
    setTracesQuery(next);
  }, []);

  const deleteSavedQuery = useCallback(async (id) => {
    try {
      await exploreService.deleteSavedQuery(selectedTeamId, id);
      toast.success('Saved query deleted');
      refetchSavedQueries();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete query');
    }
  }, [selectedTeamId, refetchSavedQueries]);

  const logsColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value) => formatTimestamp(value),
    },
    {
      title: 'Severity',
      dataIndex: 'level',
      key: 'level',
      width: 110,
      render: (value) => <Tag color={value === 'ERROR' ? 'red' : value === 'WARN' ? 'orange' : 'blue'}>{value}</Tag>,
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 180,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  const tracesColumns = [
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 220,
      render: (value) => <code>{value}</code>,
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 150,
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'HTTP',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 100,
      render: (value) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value) => <Tag color={value === 'ERROR' ? 'red' : 'green'}>{value || 'OK'}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 130,
      render: (value) => formatDuration(value),
    },
    {
      title: 'Start',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (value) => formatTimestamp(value),
    },
  ];

  const savedQueryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          {record.description && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'queryType',
      key: 'queryType',
      width: 92,
      render: (value) => <Tag>{String(value || '').toUpperCase()}</Tag>,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (value) => formatTimestamp(value),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size={8}>
          <Button size="small" onClick={() => runSavedQuery(record)} icon={<Play size={12} />}>
            Run
          </Button>
          <Popconfirm
            title="Delete saved query?"
            description="This removes it for everyone in this team."
            onConfirm={() => deleteSavedQuery(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<Trash2 size={12} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const logsTab = (
    <div className="explore-tab-content">
      <div className="explore-builder-grid">
        <div>
          <div className="explore-field-label">Severity</div>
          <Select
            mode="multiple"
            allowClear
            value={logsBuilder.levels}
            onChange={(levels) => setLogsBuilder((prev) => ({ ...prev, levels }))}
            options={Object.keys(LOG_LEVELS).map((key) => ({ label: key, value: key }))}
            placeholder="Any severity"
          />
        </div>
        <div>
          <div className="explore-field-label">Service</div>
          <Select
            allowClear
            showSearch
            value={logsBuilder.service || undefined}
            onChange={(service) => setLogsBuilder((prev) => ({ ...prev, service: service || '' }))}
            options={serviceOptions}
            placeholder="Any service"
          />
        </div>
        <div>
          <div className="explore-field-label">Message Contains</div>
          <Input
            value={logsBuilder.message}
            onChange={(e) => setLogsBuilder((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="e.g. timeout"
          />
        </div>
        <div>
          <div className="explore-field-label">Limit</div>
          <InputNumber
            min={10}
            max={500}
            value={logsBuilder.limit}
            onChange={(limit) => setLogsBuilder((prev) => ({ ...prev, limit: Number(limit || 100) }))}
            style={{ width: '100%' }}
          />
        </div>
        <div className="explore-live-tail">
          <Radio size={14} />
          <span>Live Tail</span>
          <Switch
            checked={logsBuilder.liveTail}
            onChange={(liveTail) => {
              setLogsBuilder((prev) => ({ ...prev, liveTail }));
              setLogsQuery((prev) => ({ ...prev, liveTail }));
            }}
          />
        </div>
        <Button type="primary" icon={<Play size={14} />} onClick={runLogsQuery}>
          Run Query
        </Button>
      </div>

      <div className="explore-query-preview">
        <Typography.Text type="secondary">Query</Typography.Text>
        <code>{logsExpression}</code>
      </div>

      <Table
        size="small"
        columns={logsColumns}
        dataSource={logsRows}
        loading={logsLoading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        rowKey={(row, idx) => row.id || `${row.timestamp}-${idx}`}
      />
    </div>
  );

  const metricsTab = (
    <div className="explore-tab-content">
      <div className="explore-builder-grid">
        <div>
          <div className="explore-field-label">Operation</div>
          <Select
            value={metricsBuilder.operation}
            onChange={(operation) => setMetricsBuilder((prev) => ({ ...prev, operation }))}
            options={[
              { label: 'rate(metric)', value: 'rate' },
              { label: 'ratio(metricA, metricB)', value: 'ratio' },
              { label: 'delta(metricA, metricB)', value: 'delta' },
            ]}
          />
        </div>
        <div>
          <div className="explore-field-label">Metric A</div>
          <Select
            value={metricsBuilder.metricA}
            onChange={(metricA) => setMetricsBuilder((prev) => ({ ...prev, metricA }))}
            options={METRIC_OPTIONS}
          />
        </div>
        <div>
          <div className="explore-field-label">Metric B</div>
          <Select
            value={metricsBuilder.metricB}
            onChange={(metricB) => setMetricsBuilder((prev) => ({ ...prev, metricB }))}
            disabled={metricsBuilder.operation === 'rate'}
            options={METRIC_OPTIONS}
          />
        </div>
        <div>
          <div className="explore-field-label">Service</div>
          <Select
            allowClear
            showSearch
            value={metricsBuilder.service || undefined}
            onChange={(service) => setMetricsBuilder((prev) => ({ ...prev, service: service || '' }))}
            options={serviceOptions}
            placeholder="All services"
          />
        </div>
        <Button type="primary" icon={<Play size={14} />} onClick={runMetricsQuery}>
          Run Query
        </Button>
      </div>

      <div className="explore-query-preview">
        <Typography.Text type="secondary">Expression</Typography.Text>
        <code>{metricsExpression}</code>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic title="Points" value={metricsSeries.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic title="Latest Value" value={latestMetricValue} precision={4} />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card size="small">
            <Statistic title="Refresh State" value={metricsLoading ? 'Fetching' : 'Ready'} />
          </Card>
        </Col>
      </Row>

      <Card size="small">
        {metricsSeries.length > 0 ? (
          <div className="explore-chart-wrap">
            <Line data={metricLineData} options={metricLineOptions} />
          </div>
        ) : (
          <Empty description="No metric points for selected expression" />
        )}
      </Card>
    </div>
  );

  const tracesTab = (
    <div className="explore-tab-content">
      <div className="explore-trace-builder">
        <div style={{ flex: 1 }}>
          <div className="explore-field-label">Trace Expression</div>
          <Input.TextArea
            rows={3}
            value={tracesBuilder.expression}
            onChange={(e) => setTracesBuilder((prev) => ({ ...prev, expression: e.target.value }))}
            placeholder='Example: http.status_code=500 AND service=cart AND duration>1s'
          />
        </div>
        <div className="explore-trace-controls">
          <div className="explore-field-label">Limit</div>
          <InputNumber
            min={10}
            max={200}
            value={tracesBuilder.limit}
            onChange={(limit) => setTracesBuilder((prev) => ({ ...prev, limit: Number(limit || 50) }))}
            style={{ width: '100%' }}
          />
          <Button type="primary" icon={<Play size={14} />} onClick={runTracesQuery}>
            Run Query
          </Button>
        </div>
      </div>

      <div className="explore-query-preview">
        <Typography.Text type="secondary">Query</Typography.Text>
        <code>{tracesQuery.expression}</code>
      </div>

      {traceParsed.error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message={traceParsed.error}
        />
      )}

      {!traceParsed.error && traceParsed.conditions.length > 0 && (
        <Space size={[8, 8]} wrap style={{ marginBottom: 12 }}>
          {traceParsed.conditions.map((condition, index) => (
            <Tag key={`${condition.key}-${index}`}>{`${condition.key} ${condition.operator} ${condition.value}`}</Tag>
          ))}
        </Space>
      )}

      <Table
        size="small"
        columns={tracesColumns}
        dataSource={tracesRows}
        loading={tracesLoading}
        pagination={{ pageSize: 20, showSizeChanger: true, total: tracesData?.total || tracesRows.length }}
        rowKey={(row, idx) => row.trace_id || `${row.start_time}-${idx}`}
      />
    </div>
  );

  return (
    <div className="explore-page">
      <PageHeader
        title="Explore"
        subtitle="Ad-hoc logs, metrics, and trace query surface"
        icon={<Search size={24} />}
        actions={(
          <Space>
            <Button icon={<Save size={14} />} onClick={openSaveModal}>
              Save Current Query
            </Button>
            <Button onClick={() => {
              if (activeTab === 'logs') refetchLogs();
              if (activeTab === 'metrics') refetchMetrics();
              if (activeTab === 'traces') refetchTraces();
            }}
            >
              Refresh
            </Button>
          </Space>
        )}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'logs',
                  label: <span><FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Logs</span>,
                  children: logsTab,
                },
                {
                  key: 'metrics',
                  label: <span><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Metrics</span>,
                  children: metricsTab,
                },
                {
                  key: 'traces',
                  label: <span><GitBranch size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Traces</span>,
                  children: tracesTab,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="Saved Queries"
            extra={(
              <Select
                size="small"
                value={savedTypeFilter}
                onChange={setSavedTypeFilter}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Logs', value: 'logs' },
                  { label: 'Metrics', value: 'metrics' },
                  { label: 'Traces', value: 'traces' },
                ]}
                style={{ width: 110 }}
              />
            )}
          >
            {savedQueries.length === 0 ? (
              <Empty description={savedQueriesLoading ? 'Loading queries...' : 'No saved queries yet'} />
            ) : (
              <Table
                size="small"
                columns={savedQueryColumns}
                dataSource={savedQueries}
                loading={savedQueriesLoading}
                rowKey="id"
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Save Query"
        open={isSaveModalOpen}
        onOk={saveCurrentQuery}
        onCancel={() => {
          setIsSaveModalOpen(false);
          setSavePending(null);
          saveForm.resetFields();
        }}
        okText="Save Query"
        confirmLoading={savingQuery}
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. Cart Errors > 1s" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Optional context for teammates" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
