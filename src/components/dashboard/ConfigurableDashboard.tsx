import { Col, Row, Spin } from 'antd';

import { ConfigurableChartCard } from '@components/ui/dashboard';

interface ConfigurableDashboardProps {
  config: any;
  dataSources?: any;
  isLoading?: boolean;
  extraContext?: any;
}

/**
 * ConfigurableDashboard renders a grid of charts from a parsed YAML config object.
 * @param root0
 * @param root0.config
 * @param root0.dataSources
 * @param root0.isLoading
 * @param root0.extraContext
 */
export default function ConfigurableDashboard({
  config,
  dataSources = {},
  isLoading = false,
  extraContext = {},
}: ConfigurableDashboardProps) {
  if (!config || !config.charts) return null;

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        {(config.charts as any[]).map((chartConfig: any) => {
          const colSpan = chartConfig.layout?.col || 12;
          return (
            <Col key={chartConfig.id} xs={24} lg={colSpan}>
              <ConfigurableChartCard
                chartConfig={chartConfig}
                dataSources={dataSources}
                extraContext={extraContext}
              />
            </Col>
          );
        })}
      </Row>
    </Spin>
  );
}
