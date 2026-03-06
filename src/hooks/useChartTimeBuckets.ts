import { useMemo } from 'react';

import { useTimeRange } from '@hooks/useTimeRangeQuery';

import { generateTimeBuckets, formatChartLabels } from '@utils/chartHelpers';

/**
 * Returns full-range time buckets and formatted labels for the current
 * time-range selection.  Every chart that renders a time-based x-axis
 * should call this hook so the axis always spans the entire selected window.
 * @returns
 */
export function useChartTimeBuckets() {
    const { timeRange, refreshKey, getTimeRange } = useTimeRange();

    return useMemo(() => {
        const { startTime, endTime } = getTimeRange();
        const timeBuckets = generateTimeBuckets(startTime, endTime);
        const labels = formatChartLabels(
            timeBuckets.map((ts) => ({ timestamp: ts })),
        );
        return { timeBuckets, labels };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange, refreshKey]);
}
