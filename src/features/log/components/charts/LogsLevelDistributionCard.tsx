import { Spin } from 'antd';
import { Bug } from 'lucide-react';

import LevelDistribution from '@features/log/components/log/LevelDistribution';

interface LogsLevelDistributionCardProps {
  isLoading: boolean;
  levelFacets: any[];
}

/**
 *
 * @param root0
 * @param root0.isLoading
 * @param root0.levelFacets
 */
export default function LogsLevelDistributionCard({
  isLoading,
  levelFacets,
}: LogsLevelDistributionCardProps) {
  return (
    <div className="logs-chart-card">
      <div className="logs-chart-card-header">
        <span className="logs-chart-card-title"><Bug size={15} />By Level</span>
      </div>
      <div className="logs-chart-card-body">
        {isLoading
          ? <div className="logs-chart-empty"><Spin size="small" /></div>
          : <LevelDistribution facets={levelFacets} />
        }
      </div>
    </div>
  );
}
