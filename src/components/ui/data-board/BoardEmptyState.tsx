import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyTip {
  num?: number;
  text: ReactNode;
}

interface BoardEmptyStateProps {
  entityName: string;
  tips: EmptyTip[];
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.tips
 */
export default function BoardEmptyState({ entityName, tips }: BoardEmptyStateProps) {
  return (
    <div className="oboard__empty">
      <div className="oboard__empty-icon">
        <Search size={44} strokeWidth={1} />
      </div>
      <div className="oboard__empty-title">No {entityName}s found</div>
      <div className="oboard__empty-subtitle">
        No {entityName}s matched your current filters and time range.
      </div>
      <div className="oboard__empty-tips">
        {tips.map((tip, index) => (
          <div key={index} className="oboard__empty-tip">
            <span className="oboard__empty-tip-num">{tip.num ?? index + 1}</span>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
