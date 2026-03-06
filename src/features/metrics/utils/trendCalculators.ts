export /**
        *
        */
const calculateTrends = (metricsPoints) => {
    if (!metricsPoints || metricsPoints.length < 2) return { requestTrend: 0, errorTrend: 0 };

    const recent = metricsPoints.slice(-10);
    const older = metricsPoints.slice(0, 10);

    const recentAvg = recent.reduce((sum, m) => sum + (m.request_count || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (m.request_count || 0), 0) / older.length;
    const requestTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    const recentErrorRate = recent.reduce((sum, m) => {
        const total = m.request_count || 0;
        const errors = m.error_count || 0;
        return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / recent.length;

    const olderErrorRate = older.reduce((sum, m) => {
        const total = m.request_count || 0;
        const errors = m.error_count || 0;
        return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / older.length;

    const errorTrend = olderErrorRate > 0 ? ((recentErrorRate - olderErrorRate) / olderErrorRate) * 100 : 0;

    return { requestTrend, errorTrend };
};
