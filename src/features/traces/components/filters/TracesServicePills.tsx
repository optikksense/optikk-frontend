import type { ServiceBadge } from '../../types';

interface TracesServicePillsProps {
  serviceBadges: ServiceBadge[];
  total: number;
  selectedService: string | null;
  onSelect: (serviceName: string | null) => void;
}

/**
 * Horizontal pill selector for traces service filtering.
 */
export default function TracesServicePills({
  serviceBadges,
  total,
  selectedService,
  onSelect,
}: TracesServicePillsProps): JSX.Element {
  return (
    <div className="traces-service-pills">
      <div
        className={`traces-service-pill ${!selectedService ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All <span className="traces-service-pill-count">{total}</span>
      </div>
      {serviceBadges.map(([serviceName, count]) => (
        <div
          key={serviceName}
          className={`traces-service-pill ${selectedService === serviceName ? 'active' : ''}`}
          onClick={() => onSelect(selectedService === serviceName ? null : serviceName)}
        >
          {serviceName}
          <span className="traces-service-pill-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

