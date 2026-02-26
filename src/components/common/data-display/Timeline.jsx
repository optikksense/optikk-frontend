import { Timeline as AntTimeline } from 'antd';
import { formatRelativeTime } from '@utils/formatters';
import './Timeline.css';

export default function Timeline({ items = [] }) {
  if (!items || items.length === 0) return null;

  const timelineItems = items.map((item, index) => ({
    key: index,
    color: item.color || 'var(--color-primary, #5E60CE)',
    children: (
      <div className="timeline-item-content">
        <div className="timeline-item-header">
          <span className="timeline-item-title">{item.title}</span>
          <span className="timeline-item-time">
            {item.timestamp ? formatRelativeTime(item.timestamp) : ''}
          </span>
        </div>
        {item.description && (
          <div className="timeline-item-description">{item.description}</div>
        )}
        {item.tags && (
          <div className="timeline-item-tags">
            {item.tags.map((tag, i) => (
              <span key={i} className="timeline-tag" style={{ borderColor: tag.color, color: tag.color }}>
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="custom-timeline">
      <AntTimeline items={timelineItems} />
    </div>
  );
}
