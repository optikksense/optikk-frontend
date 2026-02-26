import { useState, useMemo } from 'react';
import { Card, Row, Col, Drawer, Descriptions, Tag, Steps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Activity, Timer } from 'lucide-react';
import { useTimeRange } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { alertService } from '@services/alertService';
import { INCIDENT_STATUSES, ALERT_SEVERITIES, ALERT_STATUSES } from '@config/constants';
import { formatTimestamp, formatDuration } from '@utils/formatters';
import PageHeader from '@components/common/layout/PageHeader';
import FilterBar from '@components/common/forms/FilterBar';
import DataTable from '@components/common/data-display/DataTable';
import StatusBadge from '@components/common/feedback/StatusBadge';
import StatCard from '@components/common/cards/StatCard';
import HealthIndicator from '@components/common/cards/HealthIndicator';
import Timeline from '@components/common/data-display/Timeline';

export default function IncidentsPage() {
  const { selectedTeamId, startTime, endTime, refreshKey } = useTimeRange();
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', selectedTeamId, startTime, endTime, statusFilter, page, pageSize, refreshKey],
    queryFn: () =>
      v1Service.getIncidents(selectedTeamId, startTime, endTime, {
        statuses: statusFilter ? [statusFilter] : undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
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

  // Compute stats
  const stats = useMemo(() => {
    const totalCount = incidents.length;
    const openCount = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

    // MTTR: Mean Time to Resolve
    const resolved = incidents.filter((i) => i.resolved_at && i.created_at);
    const mttr = resolved.length > 0
      ? resolved.reduce((sum, i) => sum + (new Date(i.resolved_at) - new Date(i.created_at)), 0) / resolved.length
      : 0;

    // MTTA: Mean Time to Acknowledge
    const acknowledged = incidents.filter((i) => i.acknowledged_at && i.created_at);
    const mtta = acknowledged.length > 0
      ? acknowledged.reduce((sum, i) => sum + (new Date(i.acknowledged_at) - new Date(i.created_at)), 0) / acknowledged.length
      : 0;

    return { totalCount, openCount, mttr, mtta };
  }, [incidents]);

  const statusOptions = INCIDENT_STATUSES.map((s) => ({ label: s.label, value: s.value }));

  // Incident status to step index
  const getStepIndex = (status) => {
    const steps = ['open', 'investigating', 'identified', 'monitoring', 'resolved'];
    const idx = steps.indexOf(status?.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const openIncidentDetail = (incident) => {
    setSelectedIncident(incident);
    setDrawerOpen(true);
  };

  // Build incident timeline
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

  const columns = [
    {
      title: 'Incident',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title, record) => (
        <a onClick={() => openIncidentDetail(record)} style={{ fontWeight: 600 }}>{title}</a>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => <StatusBadge type="severity" status={severity} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge type="incident" status={status} />,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? formatTimestamp(val) : '-'),
    },
  ];

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
            onChange: setStatusFilter,
            width: 180,
          },
        ]}
      />

      <Card>
        <DataTable
          columns={columns}
          data={incidents}
          loading={isLoading}
          rowKey="incident_id"
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          onRow={(record) => ({
            onClick: () => openIncidentDetail(record),
            style: { cursor: 'pointer' },
          })}
          emptyText="No incidents found"
        />
      </Card>

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
            {selectedIncident.triggered_by && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Related Alerts</h4>
                <DataTable
                  columns={[
                    {
                      title: 'Name',
                      dataIndex: 'name',
                      key: 'name',
                      ellipsis: true,
                    },
                    {
                      title: 'Severity',
                      dataIndex: 'severity',
                      key: 'severity',
                      width: 90,
                      render: (sev) => {
                        const color = ALERT_SEVERITIES.find((s) => s.value === sev)?.color || '#98A2B3';
                        return <Tag color={color} style={{ color: '#fff' }}>{sev?.toUpperCase()}</Tag>;
                      },
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 110,
                      render: (status) => {
                        const color = ALERT_STATUSES.find((s) => s.value === status?.toUpperCase())?.color || '#98A2B3';
                        return <Tag color={color} style={{ color: '#fff' }}>{status?.toUpperCase()}</Tag>;
                      },
                    },
                    {
                      title: 'Triggered',
                      dataIndex: 'triggeredAt',
                      key: 'triggeredAt',
                      width: 140,
                      render: (ts) => ts ? formatTimestamp(ts) : '-',
                    },
                  ]}
                  data={relatedAlerts}
                  rowKey="id"
                  pagination={false}
                  emptyText="No related alerts"
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
