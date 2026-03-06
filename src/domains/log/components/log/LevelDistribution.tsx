import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber } from '@utils/formatters';

import type { LogFacet } from '../../types';

import { LevelBadge } from './LogRow';

const LEVEL_COLORS: Record<string, string> = {
  errors: APP_COLORS.hex_f04438,
  warnings: APP_COLORS.hex_f79009,
  infos: APP_COLORS.hex_06aed5,
  debugs: APP_COLORS.hex_5e60ce,
  fatals: APP_COLORS.hex_d92d20,
  traces: APP_COLORS.hex_98a2b3,
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
