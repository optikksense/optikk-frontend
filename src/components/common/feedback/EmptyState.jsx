import { Empty } from 'antd';

/**
 * Consistent empty data placeholder used across all pages and DataTable.
 */
export default function EmptyState({
  icon,
  title,
  description = 'No data found',
  action,
}) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      {icon || <Empty description={false} />}
      {title && (
        <h3 style={{ color: 'var(--text-primary)', marginTop: 16, marginBottom: 4 }}>{title}</h3>
      )}
      <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>
        {description}
      </p>
      {action}
    </div>
  );
}
