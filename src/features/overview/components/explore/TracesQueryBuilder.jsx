import { Form, Row, Col, Input, InputNumber } from 'antd';

export function TracesQueryBuilder({ query, setQuery, onRun }) {
    return (
        <Form layout="vertical" onFinish={onRun}>
            <Row gutter={16}>
                <Col span={18}>
                    <Form.Item label="Query Expression">
                        <Input
                            placeholder="e.g. http.status_code>=400 AND duration>1s"
                            value={query.expression}
                            onChange={(e) => setQuery({ ...query, expression: e.target.value })}
                            onPressEnter={onRun}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Limit">
                        <InputNumber
                            min={1} max={1000}
                            value={query.limit}
                            onChange={(v) => setQuery({ ...query, limit: v })}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
