import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import { LevelBadge } from './LogRow';

import type { LogFacet } from '../../types';

const LEVEL_COLORS: Record<string, string> = {
  fatals: '#6F1B1B',
  errors: '#FF5C5C',
  warnings: '#FFB300',
  infos: '#2871E6',
  debugs: '#6C737A',
  traces: '#B0B8C4',
};

interface LevelDistributionProps {
  facets: LogFacet[];
}

/**
 *
 * @param root0
 * @param root0.facets
 */
export default function LevelDistribution({ facets }: LevelDistributionProps) {
  if (!facets.length) return <div className="logs-chart-empty">No data</div>;

  const total = facets.reduce((sum: number, facet: LogFacet) => sum + (facet.count || 0), 0) || 1;

  return (
    <div className="logs-level-dist">
      {facets.map((facet: LogFacet) => {
        const level = (facet.value || 'INFO').toUpperCase();
        const color = LEVEL_COLORS[`${level.toLowerCase()}s`] || APP_COLORS.hex_98a2b3;
        const pct = ((facet.count / total) * 100).toFixed(1);

        return (
          <div key={facet.value} className="logs-level-dist-row">
            <LevelBadge level={level} />
            <div className="logs-level-dist-bar-bg">
              <div className="logs-level-dist-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="logs-level-dist-count">{formatNumber(facet.count)}</span>
          </div>
        );
      })}
    </div>
  );
}
