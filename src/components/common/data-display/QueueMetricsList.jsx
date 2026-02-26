import { formatNumber } from '@utils/formatters';

function formatRate(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    if (Math.abs(num) >= 1000) return formatNumber(num);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDepth(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    if (Math.abs(num) >= 1000) return formatNumber(num);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function QueueMetricsList({
    title,
    queues = [],
    selectedQueues = [],
    onToggle,
    type = 'depth' // 'depth', 'consumerLag', 'productionRate', 'consumptionRate'
}) {
    if (!queues || queues.length === 0) return null;

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
                            <th style={{ padding: '4px 8px', fontWeight: 500 }}>Topic Name</th>
                            <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>{title}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queues.map((q, idx) => {
                            const isSelected = selectedQueues.includes(q.key);
                            const isFaded = selectedQueues.length > 0 && !isSelected;

                            let selectedBg, hoverBg, valueColor, displayValue;

                            if (type === 'depth') {
                                selectedBg = 'rgba(94, 96, 206, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = '#e0e0e0';
                                displayValue = formatDepth(q.avg_queue_depth || 0);
                            } else if (type === 'consumerLag') {
                                selectedBg = 'rgba(240, 68, 56, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = (q.max_consumer_lag > 100) ? '#F04438' : '#e0e0e0';
                                displayValue = formatNumber(q.max_consumer_lag || 0);
                            } else if (type === 'productionRate') {
                                selectedBg = 'rgba(247, 144, 9, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = '#e0e0e0';
                                displayValue = `${formatRate(q.avg_publish_rate || 0)}/s`;
                            } else if (type === 'consumptionRate') {
                                selectedBg = 'rgba(6, 214, 160, 0.2)';
                                hoverBg = 'rgba(255, 255, 255, 0.05)';
                                valueColor = '#e0e0e0';
                                displayValue = `${formatRate(q.avg_receive_rate || 0)}/s`;
                            }

                            const CHART_COLORS = ['#5E60CE', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#073B4C', '#F78C6B', '#83D483', '#5E35B1'];
                            const seriesColor = CHART_COLORS[idx % CHART_COLORS.length];

                            return (
                                <tr
                                    key={q.key || `${q.queue_name || 'unknown'}::${q.service_name || 'unknown'}::${idx}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggle) onToggle(q.key);
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
                                            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{q.queue_name}</span>
                                            {q.service_name && q.service_name !== 'unknown' && <span style={{ color: '#8e8e8e', fontSize: '11px' }}>{q.service_name}</span>}
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
