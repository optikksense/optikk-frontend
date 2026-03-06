import { formatNumber } from '@utils/formatters';

/**
 *
 * @param root0
 * @param root0.facets
 * @param root0.selectedService
 * @param root0.onSelect
 */
export default function ServicePills({ facets, selectedService, onSelect }) {
    if (!facets || !facets.length) return null;
    const total = facets.reduce((sum, f) => sum + (f.count || 0), 0);
    return (
        <div className="logs-service-pills">
            <div className={`logs-service-pill ${!selectedService ? 'active' : ''}`} onClick={() => onSelect(null)}>
                All <span className="logs-service-pill-count">{formatNumber(total)}</span>
            </div>
            {facets.slice(0, 8).map((f) => (
                <div
                    key={f.value}
                    className={`logs-service-pill ${selectedService === f.value ? 'active' : ''}`}
                    onClick={() => onSelect(selectedService === f.value ? null : f.value)}
                >
                    {f.value}<span className="logs-service-pill-count">{formatNumber(f.count)}</span>
                </div>
            ))}
        </div>
    );
}
