import { Tag } from 'antd';
import { ALERT_SEVERITIES, ALERT_STATUSES, INCIDENT_STATUSES, STATUS_COLORS } from '@config/constants';
import { getHealthColor } from '@utils/formatters';

const STATUS_MAPS = {
  service: (status) => ({
    color: getHealthColor(status),
    label: status?.toUpperCase() || 'UNKNOWN',
  }),
  alert: (status) => {
    const found = ALERT_STATUSES.find((s) => s.value === status?.toUpperCase());
    return { color: found?.color || '#98A2B3', label: found?.label || status };
  },
  severity: (severity) => {
    const found = ALERT_SEVERITIES.find((s) => s.value === severity);
    return { color: found?.color || '#98A2B3', label: severity?.toUpperCase() || 'UNKNOWN' };
  },
  incident: (status) => {
    const found = INCIDENT_STATUSES.find((s) => s.value === status);
    return { color: found?.color || '#98A2B3', label: found?.label || status };
  },
  trace: (status) => ({
    color: STATUS_COLORS[status] || STATUS_COLORS.UNKNOWN,
    label: status || 'UNKNOWN',
  }),
};

/**
 * Consistent status tag/badge used across all pages.
 * @param {string} status - The status value
 * @param {string} type - 'service' | 'alert' | 'severity' | 'incident' | 'trace'
 */
export default function StatusBadge({ status, type = 'service' }) {
  const resolver = STATUS_MAPS[type] || STATUS_MAPS.service;
  const { color, label } = resolver(status);

  return (
    <Tag color={color} style={{ borderColor: color }}>
      {label}
    </Tag>
  );
}
