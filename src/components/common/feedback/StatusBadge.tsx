import { Tag } from 'antd';
import { STATUS_COLORS } from '@config/constants';
import { getHealthColor } from '@utils/formatters';

const STATUS_MAPS = {
  service: (status: string) => ({
    color: getHealthColor(status),
    label: status?.toUpperCase() || 'UNKNOWN',
  }),
  trace: (status: string) => ({
    color: STATUS_COLORS[status] || STATUS_COLORS.UNKNOWN,
    label: status || 'UNKNOWN',
  }),
};

/**
 * Consistent status tag/badge used across all pages.
 * @param {string} status - The status value
 * @param {string} type - 'service' | 'trace'
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
