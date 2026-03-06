import { Spin } from 'antd';
import { useMemo } from 'react';

import { formatNumber } from '@utils/formatters';

/* ─── Level colours ───────────────────────────────────────────────────────── */
const LEVEL_COLORS = {
    errors: '#F04438',
    warnings: '#F79009',
    infos: '#06AED5',
    debugs: '#5E60CE',
    fatals: '#D92D20',
    traces: '#98A2B3',
};

export { LEVEL_COLORS };

/* ─── VolumeBar ───────────────────────────────────────────────────────────── */
function VolumeBar({ bucket, maxTotal }) {
    if (!bucket || !maxTotal) return null;
    const totalCount = bucket.total || 0;
    const heightPct = totalCount > 0 ? Math.max((totalCount / maxTotal) * 100, 4) : 0;
    const label = (bucket.timeBucket || bucket.time_bucket || '').replace(/:00$/, '');

    const hasLevels = bucket.fatals > 0 || bucket.errors > 0 || bucket.warnings > 0 || bucket.infos > 0 || bucket.debugs > 0;

    return (
        <div
            className={`logs-volume-bar-wrapper${totalCount === 0 ? ' logs-volume-bar-wrapper--empty' : ''}`}
            title={totalCount > 0 ? `${label}  •  ${totalCount.toLocaleString()} logs` : label}
        >
            {totalCount > 0 && (
                <div className="logs-volume-bar-stack" style={{ height: `${heightPct}%` }}>
                    {bucket.fatals > 0 && <div style={{ flex: bucket.fatals, background: LEVEL_COLORS.fatals }} />}
                    {bucket.errors > 0 && <div style={{ flex: bucket.errors, background: LEVEL_COLORS.errors }} />}
                    {bucket.warnings > 0 && <div style={{ flex: bucket.warnings, background: LEVEL_COLORS.warnings }} />}
                    {bucket.infos > 0 && <div style={{ flex: bucket.infos, background: LEVEL_COLORS.infos }} />}
                    {bucket.debugs > 0 && <div style={{ flex: bucket.debugs, background: LEVEL_COLORS.debugs }} />}
                    {!hasLevels && <div style={{ flex: 1, background: '#98A2B3' }} />}
                </div>
            )}
        </div>
    );
}

/* ─── Axis tick helpers ───────────────────────────────────────────────────── */
function pickTickIndices(count, desired = 5) {
    if (count <= desired) return Array.from({ length: count }, (_, i) => i);
    const indices = [];
    for (let i = 0; i < desired; i++) {
        indices.push(Math.round((i / (desired - 1)) * (count - 1)));
    }
    return [...new Set(indices)];
}

function shortTimeLabel(raw) {
    if (!raw) return '';
    const parts = raw.split(' ');
    if (parts.length < 2) return raw;
    return parts[1].slice(0, 5);
}

/* ─── LogVolumeChart ──────────────────────────────────────────────────────── */
/**
 *
 * @param root0
 * @param root0.buckets
 * @param root0.isLoading
 */
export default function LogVolumeChart({ buckets, isLoading }) {
    const maxTotal = useMemo(
        () => Math.max(...(buckets || []).map((b) => b.total || 0), 1),
        [buckets],
    );

    if (isLoading) return <div className="logs-chart-empty"><Spin size="small" /></div>;
    if (!buckets || buckets.length === 0) return <div className="logs-chart-empty">No volume data</div>;

    const tickIndices = new Set(pickTickIndices(buckets.length, 6));

    return (
        <div className="logs-volume-chart-wrap">
            <div className="logs-volume-chart">
                {buckets.map((b, i) => (
                    <VolumeBar key={b.timeBucket || b.time_bucket || i} bucket={b} maxTotal={maxTotal} />
                ))}
            </div>
            <div className="logs-volume-axis">
                {buckets.map((b, i) => {
                    const label = b.timeBucket || b.time_bucket || '';
                    return (
                        <div
                            key={i}
                            className="logs-volume-axis-tick"
                            style={{ visibility: tickIndices.has(i) ? 'visible' : 'hidden' }}
                        >
                            {shortTimeLabel(label)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── VolumeLegend ────────────────────────────────────────────────────────── */
/**
 *
 * @param root0
 * @param root0.buckets
 */
export function VolumeLegend({ buckets }) {
    if (!buckets || !buckets.length) return null;
    const totals = buckets.reduce(
        (acc, b) => ({
            fatals: acc.fatals + (b.fatals || 0),
            errors: acc.errors + (b.errors || 0),
            warnings: acc.warnings + (b.warnings || 0),
            infos: acc.infos + (b.infos || 0),
            debugs: acc.debugs + (b.debugs || 0),
        }),
        { fatals: 0, errors: 0, warnings: 0, infos: 0, debugs: 0 },
    );

    const items = [
        { key: 'fatals', label: 'Fatal', color: LEVEL_COLORS.fatals },
        { key: 'errors', label: 'Error', color: LEVEL_COLORS.errors },
        { key: 'warnings', label: 'Warn', color: LEVEL_COLORS.warnings },
        { key: 'infos', label: 'Info', color: LEVEL_COLORS.infos },
        { key: 'debugs', label: 'Debug', color: LEVEL_COLORS.debugs },
    ].filter((item) => totals[item.key] > 0);

    if (!items.length) return null;

    return (
        <div className="logs-volume-legend">
            {items.map(({ key, label, color }) => (
                <div key={key} className="logs-volume-legend-item">
                    <span className="logs-volume-legend-dot" style={{ background: color }} />
                    <span>{label}</span>
                    <span className="logs-volume-legend-count">{formatNumber(totals[key])}</span>
                </div>
            ))}
        </div>
    );
}
