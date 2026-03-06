import { Tag } from 'antd';

import { getHealthColor } from '@utils/formatters';

import { STATUS_COLORS } from '@config/constants';

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
 * @param status.status
 * @param status - The status value
 * @param type - 'service' | 'trace'
 * @param status.type
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
