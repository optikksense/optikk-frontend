import { useState, useMemo } from 'react';
import { Row, Col, Drawer, Descriptions, Tag, Steps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Activity, Timer } from 'lucide-react';
import { useTimeRange } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { alertService } from '@services/alertService';
import { INCIDENT_STATUSES, ALERT_SEVERITIES, ALERT_STATUSES } from '@config/constants';
import { formatTimestamp, formatDuration } from '@utils/formatters';
import PageHeader from '@components/common/layout/PageHeader';
import FilterBar from '@components/common/forms/FilterBar';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';
import StatusBadge from '@components/common/feedback/StatusBadge';
import StatCard from '@components/common/cards/StatCard';
import Timeline from '@components/common/data-display/Timeline';

const INCIDENT_COLUMNS = [
  { key: 'title',        label: 'Incident', defaultWidth: 240 },
  { key: 'service_name', label: 'Service',  defaultWidth: 160 },
  { key: 'severity',     label: 'Severity', defaultWidth: 100 },
  { key: 'status',       label: 'Status',   defaultWidth: 120 },
  { key: 'created_at',   label: 'Created',  defaultWidth: 160, flex: true },
];

const PAGE_SIZE = 20;

export default function IncidentsPage() {
  const { selectedTeamId, startTime, endTime, refreshKey } = useTimeRange();
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', selectedTeamId, startTime, endTime, statusFilter, page, PAGE_SIZE, refreshKey],
    queryFn: () =>
      v1Service.getIncidents(selectedTeamId, startTime, endTime, {
        statuses: statusFilter ? [statusFilter] : undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    enabled: !!selectedTeamId,
  });

  const incidents = data?.incidents || [];
  const total = data?.total || 0;

  const { data: relatedAlertsData } = useQuery({
    queryKey: ['incident-alerts', selectedIncident?.triggered_by],
    queryFn: () => alertService.getAlertsForIncident(selectedIncident.triggered_by),
    enabled: !!selectedIncident?.triggered_by && drawerOpen,
  });
  const relatedAlerts = relatedAlertsData?.data ?? relatedAlertsData ?? [];

  const stats = useMemo(() => {
    const totalCount = incidents.length;
    const openCount = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

    const resolved = incidents.filter((i) => i.resolved_at && i.created_at);
    const mttr = resolved.length > 0
      ? resolved.reduce((sum, i) => sum + (new Date(i.resolved_at) - new Date(i.created_at)), 0) / resolved.length
      : 0;

    const acknowledged = incidents.filter((i) => i.acknowledged_at && i.created_at);
    const mtta = acknowledged.length > 0
      ? acknowledged.reduce((sum, i) => sum + (new Date(i.acknowledged_at) - new Date(i.created_at)), 0) / acknowledged.length
      : 0;

    return { totalCount, openCount, mttr, mtta };
  }, [incidents]);

  const statusOptions = INCIDENT_STATUSES.map((s) => ({ label: s.label, value: s.value }));

  const getStepIndex = (status) => {
    const steps = ['open', 'investigating', 'identified', 'monitoring', 'resolved'];
    const idx = steps.indexOf(status?.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const openIncidentDetail = (incident) => {
    setSelectedIncident(incident);
    setDrawerOpen(true);
  };

  const incidentTimeline = useMemo(() => {
    if (!selectedIncident) return [];
    const items = [];
    if (selectedIncident.created_at) {
      items.push({ title: 'Incident Created', timestamp: selectedIncident.created_at, color: '#F04438' });
    }
    if (selectedIncident.acknowledged_at) {
      items.push({ title: 'Acknowledged', timestamp: selectedIncident.acknowledged_at, color: '#F79009' });
    }
    if (selectedIncident.identified_at) {
      items.push({ title: 'Root Cause Identified', timestamp: selectedIncident.identified_at, color: '#06AED5' });
    }
    if (selectedIncident.monitoring_at) {
      items.push({ title: 'Monitoring', timestamp: selectedIncident.monitoring_at, color: '#5E60CE' });
    }
    if (selectedIncident.resolved_at) {
      items.push({ title: 'Resolved', timestamp: selectedIncident.resolved_at, color: '#73C991' });
    }
    return items;
  }, [selectedIncident]);

  const hasNextPage = total > page * PAGE_SIZE;

  return (
    <div className="incidents-page">
      <PageHeader
        title="Incidents"
        icon={<AlertTriangle size={24} />}
      />

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Incidents"
            value={stats.totalCount || total}
            icon={<AlertTriangle size={20} />}
            iconColor="#5E60CE"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Open Incidents"
            value={stats.openCount}
            icon={<Activity size={20} />}
            iconColor="#F04438"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="MTTR"
            value={stats.mttr > 0 ? formatDuration(stats.mttr) : 'N/A'}
            icon={<Clock size={20} />}
            iconColor="#F79009"
            description="Mean Time to Resolve"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="MTTA"
            value={stats.mtta > 0 ? formatDuration(stats.mtta) : 'N/A'}
            icon={<Timer size={20} />}
            iconColor="#06AED5"
            description="Mean Time to Acknowledge"
          />
        </Col>
      </Row>

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'status',
            placeholder: 'All statuses',
            options: statusOptions,
            value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            width: 180,
          },
        ]}
      />

      <div style={{ height: boardHeight(PAGE_SIZE) }}>
        <ObservabilityDataBoard
          columns={INCIDENT_COLUMNS}
          rows={incidents}
          rowKey={(row) => row.incident_id}
          entityName="incident"
          storageKey="incidents-board-cols"
          isLoading={isLoading}
          serverTotal={total}
          hasNextPage={hasNextPage}
          isFetchingNextPage={false}
          fetchNextPage={() => setPage((p) => p + 1)}
          renderRow={(row, { colWidths, visibleCols }) => (
            <>
              {visibleCols.title && (
                <div
                  style={{ width: colWidths.title, flexShrink: 0, cursor: 'pointer', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onClick={() => openIncidentDetail(row)}
                >
                  {row.title}
                </div>
              )}
              {visibleCols.service_name && (
                <div style={{ width: colWidths.service_name, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.service_name || '-'}
                </div>
              )}
              {visibleCols.severity && (
                <div style={{ width: colWidths.severity, flexShrink: 0 }}>
                  <StatusBadge type="severity" status={row.severity} />
                </div>
              )}
              {visibleCols.status && (
                <div style={{ width: colWidths.status, flexShrink: 0 }}>
                  <StatusBadge type="incident" status={row.status} />
                </div>
              )}
              {visibleCols.created_at && (
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                  {row.created_at ? formatTimestamp(row.created_at) : '-'}
                </div>
              )}
            </>
          )}
          emptyTips={[
            { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
            { num: 2, text: <>Change the <strong>status filter</strong> above</> },
            { num: 3, text: <>Check that your alerting rules are <strong>configured</strong></> },
          ]}
        />
      </div>

      {/* Incident Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedIncident?.title || 'Incident Detail'}
        width={560}
      >
        {selectedIncident && (
          <div>
            {/* Status Progression */}
            <Steps
              current={getStepIndex(selectedIncident.status)}
              size="small"
              style={{ marginBottom: 24 }}
              items={INCIDENT_STATUSES.map((s) => ({
                title: s.label,
              }))}
            />

            <Descriptions column={1} size="small" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Service">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedIncident.service_name || '-'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <StatusBadge type="severity" status={selectedIncident.severity} />
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge type="incident" status={selectedIncident.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedIncident.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {selectedIncident.created_at ? formatTimestamp(selectedIncident.created_at) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Resolved">
                {selectedIncident.resolved_at ? formatTimestamp(selectedIncident.resolved_at) : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* Incident Timeline */}
            {incidentTimeline.length > 0 && (
              <div>
                <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Timeline</h4>
                <Timeline items={incidentTimeline} />
              </div>
            )}

            {/* Related Alerts */}
            {selectedIncident.triggered_by && relatedAlerts.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Related Alerts</h4>
                {relatedAlerts.map((alert) => {
                  const color = ALERT_SEVERITIES.find((s) => s.value === alert.severity)?.color || '#98A2B3';
                  const statusColor = ALERT_STATUSES.find((s) => s.value === alert.status?.toUpperCase())?.color || '#98A2B3';
                  return (
                    <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.name}</span>
                      <Tag color={color} style={{ color: '#fff' }}>{alert.severity?.toUpperCase()}</Tag>
                      <Tag color={statusColor} style={{ color: '#fff' }}>{alert.status?.toUpperCase()}</Tag>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 }}>
                        {alert.triggeredAt ? formatTimestamp(alert.triggeredAt) : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
