import { Col, Row } from 'antd';
import { useState } from 'react';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
  DashboardRenderConfig,
} from '@/types/dashboardConfig';

import ConfigurableChartCard from './ConfigurableChartCard';

interface ConfigurableDashboardProps {
  config: DashboardRenderConfig | null;
  dataSources?: DashboardDataSources;
  isLoading?: boolean;
  extraContext?: DashboardExtraContext;
}

/** Groups flat components into visual rows based on cumulative col spans. */
function computeRows(components: DashboardComponentSpec[]): DashboardComponentSpec[][] {
  const rows: DashboardComponentSpec[][] = [];
  let current: DashboardComponentSpec[] = [];
  let used = 0;

  for (const c of components) {
    const span = c.layout?.col || 12;
    if (used + span > 24 && current.length > 0) {
      rows.push(current);
      current = [];
      used = 0;
    }
    current.push(c);
    used += span;
    if (used >= 24) {
      rows.push(current);
      current = [];
      used = 0;
    }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

/**
 * ConfigurableDashboard renders a grid of charts.
 * Cards in the same row share equal height. Each row can be collapsed.
 */
export default function ConfigurableDashboard({
  config,
  dataSources = {},
  extraContext = {},
}: ConfigurableDashboardProps) {
  const rows = config ? computeRows(config.components) : [];
  const [collapsedRows, setCollapsedRows] = useState<Set<number>>(new Set());

  if (!config || config.components.length === 0) return null;

  const toggleRow = (idx: number) => {
    setCollapsedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map((rowComponents, rowIdx) => {
        const isCollapsed = collapsedRows.has(rowIdx);
        const rowTitle = rowComponents.map((c) => c.title as string).filter(Boolean).join(' · ');

        return (
          <div key={rowIdx}>
            <div
              onClick={() => toggleRow(rowIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: isCollapsed ? 0 : 8,
                padding: '2px 0',
                userSelect: 'none',
              }}
            >
              <span style={{
                fontSize: 11,
                color: 'var(--text-muted, #666)',
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
                display: 'inline-block',
                lineHeight: 1,
              }}>▾</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted, #888)', letterSpacing: '0.02em' }}>
                {rowTitle}
              </span>
            </div>

            {!isCollapsed && (
              <Row gutter={[16, 0]} align="stretch" style={{ marginBottom: 0 }}>
                {rowComponents.map((componentConfig) => {
                  const colSpan = componentConfig.layout?.col || 12;
                  return (
                    <Col
                      key={componentConfig.id}
                      xs={24}
                      lg={colSpan}
                      style={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <ConfigurableChartCard
                        componentConfig={componentConfig}
                        dataSources={dataSources}
                        extraContext={extraContext}
                      />
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        );
      })}
    </div>
  );
}
