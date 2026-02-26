import { formatNumber, formatDuration } from '@utils/formatters';

export default function DatabaseTopTablesList({
    tables = [],
    selectedTables = [],
    onToggle,
}) {
    if (!tables || tables.length === 0) return null;

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
                            <th style={{ padding: '4px 8px', fontWeight: 500 }}>Table Name</th>
                            <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>Queries</th>
                            <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>Avg Latency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.map((t, idx) => {
                            const isSelected = selectedTables.includes(t.key);
                            const isFaded = selectedTables.length > 0 && !isSelected;

                            let selectedBg = 'rgba(94, 96, 206, 0.2)';
                            let hoverBg = 'rgba(255, 255, 255, 0.05)';
                            let latencyColor = t.avg_query_latency_ms > 100 ? '#F04438' : t.avg_query_latency_ms > 50 ? '#F79009' : '#e0e0e0';

                            const CHART_COLORS = ['#5E60CE', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#073B4C', '#F78C6B', '#83D483', '#5E35B1'];
                            const seriesColor = CHART_COLORS[idx % CHART_COLORS.length];

                            return (
                                <tr
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggle) onToggle(t.key);
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
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: seriesColor, flexShrink: 0 }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{t.table_name || 'unknown'}</span>
                                            {t.service_name && t.service_name !== 'unknown' && <span style={{ color: '#8e8e8e', fontSize: '11px' }}>{t.service_name}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', color: '#e0e0e0', fontFamily: 'monospace' }}>
                                        {formatNumber(t.query_count || 0)}
                                    </td>
                                    <td style={{ padding: '4px 8px', textAlign: 'right', color: latencyColor, fontFamily: 'monospace' }}>
                                        {formatDuration(t.avg_query_latency_ms || 0)}
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
