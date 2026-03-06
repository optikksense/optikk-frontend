import { APP_COLORS } from '@config/colorLiterals';
import { Timeline as AntTimeline } from 'antd';

import { formatRelativeTime } from '@utils/formatters';
import './Timeline.css';

interface TimelineTag {
  color: string;
  label: string;
}

interface TimelineItemData {
  color?: string;
  title?: string;
  timestamp?: string | number;
  description?: string;
  tags?: TimelineTag[];
}

interface TimelineProps {
  items?: TimelineItemData[];
}

/**
 * Renders timeline entries with optional tags and relative timestamps.
 * @param props Component props.
 * @returns Timeline component or null when empty.
 */
export default function Timeline({ items = [] }: TimelineProps): JSX.Element | null {
  if (items.length === 0) return null;

  const timelineItems = items.map((item, index) => ({
    key: index,
    color: item.color || `var(--color-primary, ${APP_COLORS.hex_5e60ce})`,
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
            {item.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="timeline-tag"
                style={{ borderColor: tag.color, color: tag.color }}
              >
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
