import { Form, Row, Col, Select, Input } from 'antd';

export function LogsQueryBuilder({ query, setQuery, onRun }) {
    return (
        <Form layout="vertical" onFinish={onRun}>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item label="Service">
                        <Input
                            placeholder="e.g. auth-service"
                            value={query.service}
                            onChange={(e) => setQuery({ ...query, service: e.target.value })}
                            onPressEnter={onRun}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Log Level">
                        <Select
                            allowClear
                            placeholder="All Levels"
                            value={query.level}
                            onChange={(v) => setQuery({ ...query, level: v })}
                        >
                            <Select.Option value="error">ERROR</Select.Option>
                            <Select.Option value="warn">WARN</Select.Option>
                            <Select.Option value="info">INFO</Select.Option>
                            <Select.Option value="debug">DEBUG</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Search Message">
                        <Input
                            placeholder="e.g. connection refused"
                            value={query.search}
                            onChange={(e) => setQuery({ ...query, search: e.target.value })}
                            onPressEnter={onRun}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
