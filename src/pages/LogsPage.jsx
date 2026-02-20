import { useMemo, useState } from 'react';
import {
  Card, Tag, Button, Row, Col, Badge, Switch, Tabs, Select, Input, Space, Progress,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Radio, Filter, Search, ShieldAlert, Link2 } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { formatTimestamp, formatNumber } from '@utils/formatters';
import { LOG_LEVELS } from '@config/constants';
import { PageHeader, DataTable, DetailDrawer, StatCard } from '@components/common';
import LogHistogram from '@components/charts/LogHistogram';

function safeLower(v) {
  return String(v || '').toLowerCase();
}

export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [hostFilter, setHostFilter] = useState('');
  const [containerFilter, setContainerFilter] = useState('');
  const [traceFilter, setTraceFilter] = useState('');
  const [hasExceptionOnly, setHasExceptionOnly] = useState(false);
  const [correlatedOnly, setCorrelatedOnly] = useState(false);
  const [liveTail, setLiveTail] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');

  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useQuery({
    queryKey: [
      'logs-v2',
      selectedTeamId,
      timeRange.value,
      page,
      pageSize,
      searchText,
      selectedLevels,
      selectedServices,
      refreshKey,
    ],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        levels: selectedLevels.length > 0 ? selectedLevels : undefined,
        services: selectedServices.length > 0 ? selectedServices : undefined,
        search: searchText || undefined,
        limit: pageSize,
        offset,
      });
    },
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
  });

  const { data: histogramData } = useQuery({
    queryKey: ['log-histogram', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogHistogram(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
  });

  const { data: contextData } = useQuery({
    queryKey: ['log-context', selectedTeamId, selectedLog?.trace_id, selectedLog?.span_id, selectedLog?.timestamp],
    queryFn: () =>
      v1Service.getLogDetail(selectedTeamId, selectedLog.trace_id, selectedLog.span_id, selectedLog.timestamp),
    enabled: !!selectedTeamId && !!selectedLog?.trace_id && drawerTab === 'context',
  });

  const rawLogs = Array.isArray(data?.logs) ? data.logs : [];
  const serverTotal = Number(data?.total || 0);
  const rawFacets = data?.facets || {};

  const facets = {
    levels: Array.isArray(rawFacets.levels)
      ? rawFacets.levels.reduce((acc, item) => {
        acc[item.level] = item.count;
        return acc;
      }, {})
      : (rawFacets.levels || {}),
    services: Array.isArray(rawFacets.services)
      ? rawFacets.services.reduce((acc, item) => {
        acc[item.service_name] = item.count;
        return acc;
      }, {})
      : (rawFacets.services || {}),
  };

  const histogramRaw = histogramData || [];
  const histogram = Array.isArray(histogramRaw)
    ? histogramRaw.map((h) => ({ ...h, timestamp: h.time_bucket || h.timestamp }))
    : [];

  const contextLogs = contextData?.logs || [];

  const clientFilteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      const hostOk = !hostFilter || safeLower(log.host).includes(safeLower(hostFilter));
      const containerOk = !containerFilter || safeLower(log.container).includes(safeLower(containerFilter));
      const traceOk = !traceFilter || safeLower(log.trace_id).includes(safeLower(traceFilter));
      const exceptionOk = !hasExceptionOnly || !!log.exception;
      const correlatedOk = !correlatedOnly || !!log.trace_id || !!log.span_id;
      return hostOk && containerOk && traceOk && exceptionOk && correlatedOk;
    });
  }, [rawLogs, hostFilter, containerFilter, traceFilter, hasExceptionOnly, correlatedOnly]);

  const stats = useMemo(() => {
    const total = clientFilteredLogs.length;
    const errorLike = clientFilteredLogs.filter((l) => ['ERROR', 'FATAL'].includes(String(l.level).toUpperCase())).length;
    const warn = clientFilteredLogs.filter((l) => String(l.level).toUpperCase() === 'WARN').length;
    const exceptions = clientFilteredLogs.filter((l) => !!l.exception).length;
    const correlated = clientFilteredLogs.filter((l) => !!l.trace_id || !!l.span_id).length;
    const uniqueServices = new Set(clientFilteredLogs.map((l) => l.service_name).filter(Boolean)).size;

    return {
      total,
      errorLike,
      warn,
      exceptions,
      correlated,
      uniqueServices,
      errorRate: total > 0 ? (errorLike / total) * 100 : 0,
      correlationRate: total > 0 ? (correlated / total) * 100 : 0,
    };
  }, [clientFilteredLogs]);

  const topHosts = useMemo(() => {
    const counts = {};
    clientFilteredLogs.forEach((l) => {
      const host = l.host || 'unknown';
      counts[host] = (counts[host] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [clientFilteredLogs]);

  const topServices = useMemo(() => {
    const counts = facets.services || {};
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [facets.services]);

  const openLogDetail = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
    setDrawerTab('details');
  };

  const highlightMessage = (msg) => {
    if (!msg) return '-';
    const message = String(msg);
    return (
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {message.split(/(".*?"|'.*?'|\b\d+\.?\d*\b|\b(?:ERROR|WARN|FATAL|null|true|false|undefined|NULL)\b)/g).map((part, i) => {
          if (/^["'].*["']$/.test(part)) return <span key={i} style={{ color: '#06AED5' }}>{part}</span>;
          if (/^\d+\.?\d*$/.test(part)) return <span key={i} style={{ color: '#73C991' }}>{part}</span>;
          if (/^(ERROR|FATAL)$/i.test(part)) return <span key={i} style={{ color: '#F04438', fontWeight: 600 }}>{part}</span>;
          if (/^WARN$/i.test(part)) return <span key={i} style={{ color: '#F79009', fontWeight: 600 }}>{part}</span>;
          if (/^(null|true|false|undefined|NULL)$/.test(part)) return <span key={i} style={{ color: '#9E77ED' }}>{part}</span>;
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => {
        try {
          return formatTimestamp(timestamp);
        } catch {
          return '-';
        }
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => {
        const config = LOG_LEVELS[level] || LOG_LEVELS.INFO || { label: 'Info', color: '#73C991' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 160,
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      width: 140,
      render: (v) => v || '-',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: highlightMessage,
    },
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 200,
      render: (traceId) => (traceId ? <code style={{ fontSize: 11 }}>{String(traceId).substring(0, 16)}...</code> : '-'),
    },
  ];

  const levelOptions = Object.entries(LOG_LEVELS).map(([key, value]) => ({
    label: value.label,
    value: key,
  }));

  const serviceOptions = Object.keys(facets.services || {}).map((service) => ({ label: service, value: service }));

  const exportCurrentRows = () => {
    const rows = clientFilteredLogs.map((l) => ({
      timestamp: l.timestamp,
      level: l.level,
      service: l.service_name,
      host: l.host,
      trace_id: l.trace_id,
      message: String(l.message || '').replace(/\n/g, ' '),
    }));

    const header = ['timestamp', 'level', 'service', 'host', 'trace_id', 'message'];
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Logs" icon={<FileText size={24} />} subtitle="Enterprise log search, correlation, and triage" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Visible Logs" value={formatNumber(stats.total)} icon={<FileText size={18} />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Error Ratio"
            value={`${stats.errorRate.toFixed(2)}%`}
            icon={<ShieldAlert size={18} />}
            iconColor={stats.errorRate > 8 ? '#F04438' : stats.errorRate > 2 ? '#F79009' : '#73C991'}
            description={`${formatNumber(stats.errorLike)} errors`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Correlated" value={`${stats.correlationRate.toFixed(1)}%`} icon={<Link2 size={18} />} description={`${formatNumber(stats.correlated)} with trace/span`} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Unique Services" value={stats.uniqueServices} icon={<Filter size={18} />} description={`${formatNumber(serverTotal)} server-side total`} />
        </Col>
      </Row>

      {histogram.length > 0 && (
        <Card className="chart-card" style={{ marginBottom: 16 }}>
          <LogHistogram data={histogram} />
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Input
            prefix={<Search size={14} />}
            allowClear
            placeholder="Full-text search"
            value={searchText}
            onChange={(e) => {
              setPage(1);
              setSearchText(e.target.value);
            }}
            style={{ width: 260 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Levels"
            options={levelOptions}
            value={selectedLevels}
            onChange={(v) => {
              setPage(1);
              setSelectedLevels(v || []);
            }}
            style={{ minWidth: 180 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Services"
            options={serviceOptions}
            value={selectedServices}
            onChange={(v) => {
              setPage(1);
              setSelectedServices(v || []);
            }}
            style={{ minWidth: 220 }}
          />
          <Input
            allowClear
            placeholder="Host contains"
            value={hostFilter}
            onChange={(e) => setHostFilter(e.target.value)}
            style={{ width: 170 }}
          />
          <Input
            allowClear
            placeholder="Container contains"
            value={containerFilter}
            onChange={(e) => setContainerFilter(e.target.value)}
            style={{ width: 180 }}
          />
          <Input
            allowClear
            placeholder="Trace ID contains"
            value={traceFilter}
            onChange={(e) => setTraceFilter(e.target.value)}
            style={{ width: 190 }}
          />
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Space size={16}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Exception Only <Switch size="small" checked={hasExceptionOnly} onChange={setHasExceptionOnly} />
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Correlated Only <Switch size="small" checked={correlatedOnly} onChange={setCorrelatedOnly} />
            </span>
            <span style={{ fontSize: 12, color: liveTail ? '#73C991' : 'var(--text-muted)' }}>
              <Radio size={14} className={liveTail ? 'live-tail-icon-active' : ''} style={{ marginRight: 6 }} />
              Live Tail <Switch size="small" checked={liveTail} onChange={setLiveTail} />
            </span>
          </Space>
          <Button icon={<Download size={14} />} onClick={exportCurrentRows}>Export Visible</Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Level Distribution" size="small">
            {Object.entries(LOG_LEVELS).map(([key, cfg]) => {
              const count = Number(facets.levels?.[key] || 0);
              const pct = serverTotal > 0 ? (count / serverTotal) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cfg.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatNumber(count)}</span>
                  </div>
                  <Progress percent={Number(pct.toFixed(2))} size="small" showInfo={false} strokeColor={cfg.color} />
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Services and Hosts" size="small">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Services</div>
                {topServices.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No data</span> : topServices.map(([name, count]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Hosts</div>
                {topHosts.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No data</span> : topHosts.map(([name, count]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable
          columns={columns}
          data={clientFilteredLogs}
          loading={isLoading}
          rowKey={(record, index) =>
            (record.trace_id && record.span_id)
              ? `${record.trace_id}-${record.span_id}-${record.timestamp}`
              : `log-${index}-${record.timestamp}`
          }
          page={liveTail ? 1 : page}
          pageSize={pageSize}
          total={serverTotal}
          onPageChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          onRow={(record) => ({ onClick: () => openLogDetail(record), style: { cursor: 'pointer' } })}
          emptyText="No logs matched your filters"
        />
      </Card>

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Detail"
        width={700}
        data={selectedLog}
        sections={[
          {
            title: (
              <Tabs
                activeKey={drawerTab}
                onChange={setDrawerTab}
                size="small"
                items={[
                  { key: 'details', label: 'Details' },
                  { key: 'context', label: 'Context' },
                  { key: 'json', label: 'JSON' },
                ]}
              />
            ),
            fields: drawerTab === 'details'
              ? [
                { label: 'Timestamp', key: 'timestamp', render: (v) => formatTimestamp(v) },
                {
                  label: 'Level',
                  key: 'level',
                  render: (v) => {
                    const config = LOG_LEVELS[v] || LOG_LEVELS.INFO;
                    return <Tag color={config.color}>{config.label}</Tag>;
                  },
                },
                { label: 'Service', key: 'service_name' },
                { label: 'Message', key: 'message' },
                { label: 'Trace ID', key: 'trace_id' },
                { label: 'Span ID', key: 'span_id' },
                { label: 'Host', key: 'host' },
                { label: 'Pod', key: 'pod' },
                { label: 'Container', key: 'container' },
                {
                  label: 'Exception',
                  key: 'exception',
                  render: (v) => (v ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{v}</pre> : '-'),
                },
              ]
              : drawerTab === 'context'
                ? [
                  {
                    label: 'Surrounding Logs',
                    key: '_context',
                    render: () => (
                      <div style={{ maxHeight: 420, overflow: 'auto' }}>
                        {contextLogs.length > 0 ? contextLogs.map((log, i) => {
                          const isCurrent = log.trace_id === selectedLog?.trace_id
                            && log.span_id === selectedLog?.span_id
                            && log.timestamp === selectedLog?.timestamp;
                          return (
                            <div
                              key={i}
                              style={{
                                padding: '6px 8px',
                                fontSize: 11,
                                fontFamily: 'monospace',
                                background: isCurrent ? 'rgba(94, 96, 206, 0.15)' : 'transparent',
                                borderLeft: isCurrent ? '3px solid #5E60CE' : '3px solid transparent',
                              }}
                            >
                              <span style={{ color: 'var(--text-muted)' }}>{formatTimestamp(log.timestamp)}</span>
                              {' '}
                              <Tag color={(LOG_LEVELS[log.level] || LOG_LEVELS.INFO).color} style={{ fontSize: 10 }}>{log.level}</Tag>
                              {' '}
                              <span style={{ color: 'var(--text-primary)' }}>{log.message}</span>
                            </div>
                          );
                        }) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No context logs available</span>}
                      </div>
                    ),
                  },
                ]
                : [
                  {
                    label: 'Raw JSON',
                    key: '_json',
                    render: () => (
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, fontFamily: 'monospace', maxHeight: 500, overflow: 'auto', color: 'var(--text-primary)' }}>
                        {JSON.stringify(selectedLog, null, 2)}
                      </pre>
                    ),
                  },
                ],
          },
        ]}
      />

      <style>{`
        .live-tail-icon-active { color: #73C991; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
