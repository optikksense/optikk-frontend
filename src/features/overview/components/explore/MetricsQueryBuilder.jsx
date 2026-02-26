import { Form, Row, Col, Select, Input } from 'antd';
import { METRIC_OPTIONS } from './constants';

export function MetricsQueryBuilder({ query, setQuery, onRun }) {
    return (
        <Form layout="vertical" onFinish={onRun}>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item label="Operation">
                        <Select
                            value={query.operation}
                            onChange={(v) => setQuery({ ...query, operation: v })}
                        >
                            <Select.Option value="raw">Raw Metric</Select.Option>
                            <Select.Option value="ratio">Ratio (A / B)</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Metric A">
                        <Select
                            value={query.metricA}
                            onChange={(v) => setQuery({ ...query, metricA: v })}
                            options={METRIC_OPTIONS}
                        />
                    </Form.Item>
                </Col>
                {query.operation === 'ratio' && (
                    <Col span={6}>
                        <Form.Item label="Metric B">
                            <Select
                                value={query.metricB}
                                onChange={(v) => setQuery({ ...query, metricB: v })}
                                options={METRIC_OPTIONS}
                            />
                        </Form.Item>
                    </Col>
                )}
                <Col span={6}>
                    <Form.Item label="Service (Optional)">
                        <Input
                            placeholder="e.g. cart-service"
                            value={query.service}
                            onChange={(e) => setQuery({ ...query, service: e.target.value })}
                            onPressEnter={onRun}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
