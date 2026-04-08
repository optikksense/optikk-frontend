import { formatNumber } from "@shared/utils/formatters";

import type { LogFacet } from "../../types";

interface ServicePillsProps {
  facets: LogFacet[];
  selectedService: string | null;
  onSelect: (value: string | null) => void;
}

/**
 *
 * @param root0
 * @param root0.facets
 * @param root0.selectedService
 * @param root0.onSelect
 */
export default function ServicePills({ facets, selectedService, onSelect }: ServicePillsProps) {
  if (!facets.length) return null;

  const total = facets.reduce((sum: number, facet: LogFacet) => sum + (facet.count || 0), 0);

  return (
    <div className="logs-service-pills">
      <div
        className={`logs-service-pill ${!selectedService ? "active" : ""}`}
        onClick={() => onSelect(null)}
      >
        All <span className="logs-service-pill-count">{formatNumber(total)}</span>
      </div>
      {facets.slice(0, 8).map((facet: LogFacet) => (
        <div
          key={facet.value}
          className={`logs-service-pill ${selectedService === facet.value ? "active" : ""}`}
          onClick={() => onSelect(selectedService === facet.value ? null : facet.value)}
        >
          {facet.value}
          <span className="logs-service-pill-count">{formatNumber(facet.count)}</span>
        </div>
      ))}
    </div>
  );
}
