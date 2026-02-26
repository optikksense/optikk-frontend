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
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  Radio,
} from 'antd';
import { Search, Save, FileText, Activity, Layers, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { exploreService } from '@services/exploreService';
import { PageHeader } from '@components/common';
import { LOG_LEVELS } from '@config/constants';

import {
  resolveTimeRange,
  parseTraceExpression,
  buildLogsExpression,
  buildMetricsExpression,
  evaluateMetricsExpression,
  normalizeSavedQueryPayload
} from '../../utils/exploreUtils';

import {
  DEFAULT_METRICS_QUERY,
  DEFAULT_TRACES_QUERY,
} from '../../components/explore/constants';

import { LogsQueryBuilder } from '../../components/explore/LogsQueryBuilder';
import { LogsResultView } from '../../components/explore/LogsResultView';
import { MetricsQueryBuilder } from '../../components/explore/MetricsQueryBuilder';
import { MetricsResultView } from '../../components/explore/MetricsResultView';
import { TracesQueryBuilder } from '../../components/explore/TracesQueryBuilder';
import { TracesResultView } from '../../components/explore/TracesResultView';
import { SavedQueryTable } from '../../components/explore/SavedQueryTable';

const DEFAULT_LOGS_QUERY = { levels: [], service: '', message: '', limit: 100, liveTail: false };

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

  const runLogsQuery = useCallback(() => {
    setLogsQuery({ /* ... */ });
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

  const logsTab = (
    <div className="explore-tab-content">
      <LogsQueryBuilder query={logsBuilder} setQuery={setLogsBuilder} onRun={runLogsQuery} />
      <div className="explore-query-preview">
        <Typography.Text type="secondary">Query</Typography.Text>
        <code>{logsExpression}</code>
      </div>
      <LogsResultView logsRows={logsRows} logsLoading={logsLoading} />
    </div>
  );

  const metricsTab = (
    <div className="explore-tab-content">
      <MetricsQueryBuilder query={metricsBuilder} setQuery={setMetricsBuilder} onRun={runMetricsQuery} />
      <div className="explore-query-preview">
        <Typography.Text type="secondary">Expression</Typography.Text>
        <code>{metricsExpression}</code>
      </div>
      <MetricsResultView metricsSeries={metricsSeries} metricsExpression={metricsExpression} metricsLoading={metricsLoading} />
    </div>
  );

  const tracesTab = (
    <div className="explore-tab-content">
      <TracesQueryBuilder query={tracesBuilder} setQuery={setTracesBuilder} onRun={runTracesQuery} />
      <div className="explore-query-preview">
        <Typography.Text type="secondary">Query</Typography.Text>
        <code>{tracesQuery.expression}</code>
      </div>
      <TracesResultView tracesRows={tracesRows} tracesLoading={tracesLoading} tracesData={tracesData} traceParsed={traceParsed} />
    </div>
  );

  const savedQueriesTab = (
    <div className="explore-tab-content">
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 150 }}
          value={savedTypeFilter}
          onChange={setSavedTypeFilter}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Logs', value: 'logs' },
            { label: 'Metrics', value: 'metrics' },
            { label: 'Traces', value: 'traces' },
          ]}
        />
      </div>
      <SavedQueryTable
        savedQueries={savedQueries}
        savedQueriesLoading={savedQueriesLoading}
        runSavedQuery={runSavedQuery}
        deleteSavedQuery={deleteSavedQuery}
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
                  label: <span><Layers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Traces</span>,
                  children: tracesTab,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bookmark size={16} /> Saved Queries
              </div>
            }
          >
            {savedQueriesTab}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Save Query"
        open={isSaveModalOpen}
        onCancel={() => { setIsSaveModalOpen(false); setSavePending(null); }}
        onOk={saveCurrentQuery}
        confirmLoading={savingQuery}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <span>
              Saving <strong>{savePending?.queryType}</strong> query:{' '}
              <code>{savePending?.query?.queryText}</code>
            </span>
          }
        />
        <Form form={saveForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. 500 Errors in Checkout" />
          </Form.Item>
          <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea placeholder="What is this query for?" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
