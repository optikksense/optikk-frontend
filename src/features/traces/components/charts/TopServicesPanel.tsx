import type { ServiceBadge } from '../../types';

interface TopServicesPanelProps {
  serviceBadges: ServiceBadge[];
}

/**
 * Top-N services panel used beside the latency histogram on traces page.
 */
export default function TopServicesPanel({ serviceBadges }: TopServicesPanelProps): JSX.Element {
  if (serviceBadges.length === 0) {
    return <div className="traces-histogram-empty">No service data</div>;
  }

  const maxCount = serviceBadges[0]?.[1] || 1;
  return (
    <div className="traces-top-services">
      {serviceBadges.slice(0, 7).map(([serviceName, count]) => (
        <div key={serviceName} className="traces-top-service-row">
          <span className="traces-top-service-name">{serviceName}</span>
          <div className="traces-top-service-bar-bg">
            <div
              className="traces-top-service-bar-fill"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="traces-top-service-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

