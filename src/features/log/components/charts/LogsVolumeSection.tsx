import { BarChart3 } from 'lucide-react';

import LogVolumeChart, { VolumeLegend } from '@features/log/components/log/LogVolumeChart';

interface LogsVolumeSectionProps {
  volumeBuckets: any[];
  isLoading: boolean;
}

/**
 *
 * @param root0
 * @param root0.volumeBuckets
 * @param root0.isLoading
 */
export default function LogsVolumeSection({ volumeBuckets, isLoading }: LogsVolumeSectionProps) {
  return (
    <div className="logs-chart-card logs-chart-card--wide">
      <div className="logs-chart-card-header">
        <span className="logs-chart-card-title"><BarChart3 size={15} />Log Volume</span>
        <VolumeLegend buckets={volumeBuckets} />
      </div>
      <div className="logs-chart-card-body">
        <LogVolumeChart buckets={volumeBuckets} isLoading={isLoading} />
      </div>
    </div>
  );
}
