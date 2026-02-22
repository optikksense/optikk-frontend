import { formatNumber, formatDuration } from '@utils/formatters';

/**
 * Reusable component for displaying top endpoints below charts
 *
 * @param {string} title - The suffix for the title e.g. "Requests", "Error Rate", "Latency"
 * @param {Array} endpoints - The list of endpoint objects
 * @param {Array} selectedEndpoints - The currently selected endpoint keys
 * @param {Function} onToggle - Callback when an endpoint is clicked
 * @param {string} type - 'requests', 'errorRate', 'latency' determines rendering
 */
export default function TopEndpointsList({
    title,
    endpoints = [],
    selectedEndpoints = [],
    onToggle,
    type = 'requests' // 'requests', 'errorRate', 'latency'
}) {
    if (!endpoints || endpoints.length === 0) return null;

    return (
        <div style={{ marginTop: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border-color, #2D2D2D) transparent'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: '#8e8e8e', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <th style={{ padding: '4px 8px', fontWeight: 500 }}>Name</th>
                            <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>{title}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {endpoints.map((ep, idx) => {
                            const isSelected = selectedEndpoints.includes(ep.key);
                            const isFaded = selectedEndpoints.length > 0 && !isSelected;

                            let selectedBg, hoverBg, valueColor, displayValue;

                            if (type === 'requests') {
                                selectedBg = 'rgba(94, 96, 206, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = '#e0e0e0';
                                displayValue = formatNumber(ep.request_count || 0);
                            } else if (type === 'errorRate') {
                                selectedBg = 'rgba(240, 68, 56, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = (ep.errorRate > 5 || (ep.errorRate === undefined && ep.value > 5)) ? '#F04438' : '#e0e0e0';
                                const rate = ep.errorRate !== undefined ? ep.errorRate : ep.value || 0;
                                displayValue = `${Number(rate).toFixed(2)}%`;
                            } else if (type === 'latency') {
                                selectedBg = 'rgba(247, 144, 9, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = ep.latency > 500 ? '#F04438' : ep.latency > 200 ? '#F79009' : '#e0e0e0';
                                displayValue = formatDuration(ep.latency);
                            }

                            // Generate a consistent color based on index or logic (matching chartColors if possible)
                            // Assuming getChartColor logic is available or we just use a predefined set for now
                            // we'll try to match the palette used in charts
                            const CHART_COLORS = ['#5E60CE', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#073B4C', '#F78C6B', '#83D483', '#5E35B1'];
                            const seriesColor = CHART_COLORS[idx % CHART_COLORS.length];

                            return (
                                <tr
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggle) onToggle(ep.key);
                                    }}
                                    style={{
                                        background: isSelected ? selectedBg : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        opacity: isFaded ? 0.4 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isFaded) {
                                            e.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isSelected ? selectedBg : 'transparent';
                                    }}
                                >
                                    <td style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '2px', backgroundColor: seriesColor, flexShrink: 0 }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{ep.endpoint}</span>
                                            {ep.service && <span style={{ color: '#8e8e8e', fontSize: '11px' }}>{ep.service}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', color: valueColor, fontFamily: 'monospace' }}>
                                        {displayValue}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
