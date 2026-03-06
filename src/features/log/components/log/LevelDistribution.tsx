import { formatNumber } from '@utils/formatters';

import { LevelBadge } from './LogRow';

const LEVEL_COLORS = {
    errors: '#F04438',
    warnings: '#F79009',
    infos: '#06AED5',
    debugs: '#5E60CE',
    fatals: '#D92D20',
    traces: '#98A2B3',
};

/**
 *
 * @param root0
 * @param root0.facets
 */
export default function LevelDistribution({ facets }) {
    if (!facets || !facets.length) return <div className="logs-chart-empty">No data</div>;
    const total = facets.reduce((sum, f) => sum + (f.count || 0), 0) || 1;
    return (
        <div className="logs-level-dist">
            {facets.map((f) => {
                const lvl = (f.value || 'INFO').toUpperCase();
                const color = LEVEL_COLORS[lvl.toLowerCase() + 's'] || '#98A2B3';
                const pct = ((f.count / total) * 100).toFixed(1);
                return (
                    <div key={f.value} className="logs-level-dist-row">
                        <LevelBadge level={lvl} />
                        <div className="logs-level-dist-bar-bg">
                            <div className="logs-level-dist-bar-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="logs-level-dist-count">{formatNumber(f.count)}</span>
                    </div>
                );
            })}
        </div>
    );
}
