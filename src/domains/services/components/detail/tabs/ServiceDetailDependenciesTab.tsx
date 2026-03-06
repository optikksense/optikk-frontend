import { APP_COLORS } from '@config/colorLiterals';
import { Card, Empty } from 'antd';
import { Network } from 'lucide-react';

import { formatNumber } from '@utils/formatters';

interface ServiceDependency {
  source: string;
  target: string;
  call_count?: number;
}

interface ServiceDetailDependenciesTabProps {
  serviceName: string;
  serviceDependencies: ServiceDependency[];
  onNavigateService: (service: string) => void;
}

/**
 * Dependency graph/list tab for service detail page.
 */
export default function ServiceDetailDependenciesTab({
  serviceName,
  serviceDependencies,
  onNavigateService,
}: ServiceDetailDependenciesTabProps): JSX.Element {
  return (
    <Card className="chart-card" size="small">
      {serviceDependencies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {serviceDependencies.map((dependency, index) => {
            const isOutgoing = dependency.source === serviceName;
            const otherService = isOutgoing ? dependency.target : dependency.source;

            return (
              <div
                key={index}
                style={{
                  padding: 12,
                  background: `var(--bg-secondary, ${APP_COLORS.hex_0d0d0d})`,
                  borderRadius: 6,
                  border: `1px solid var(--border-color, ${APP_COLORS.hex_2d2d2d})`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Network size={16} />
                  <span style={{ fontWeight: 600 }}>{serviceName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <a
                    onClick={() => onNavigateService(otherService)}
                    style={{ color: APP_COLORS.hex_1890ff, cursor: 'pointer' }}
                  >
                    {otherService}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Calls: {formatNumber(dependency.call_count || 0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty description="No dependencies found" />
      )}
    </Card>
  );
}

