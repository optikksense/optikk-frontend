import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { ALERT_SEVERITIES, ALERT_TYPES, ALERT_OPERATORS } from '@config/constants';

export default function CreateAlertModal({ open, onCancel, onSubmit, loading }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title="Create Alert Rule"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Required' }]}>
          <Input placeholder="e.g., High Error Rate" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Describe this alert" />
        </Form.Item>

        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select options={ALERT_TYPES} placeholder="Select type" />
        </Form.Item>

        <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
          <Select options={ALERT_SEVERITIES.map((s) => ({ label: s.label, value: s.value }))} placeholder="Select severity" />
        </Form.Item>

        <Form.Item name="serviceName" label="Service Name" rules={[{ required: true }]}>
          <Input placeholder="e.g., api-gateway" />
        </Form.Item>

        <Form.Item name="metric" label="Metric" rules={[{ required: true }]}>
          <Input placeholder="e.g., error_rate" />
        </Form.Item>

        <Form.Item name="operator" label="Operator" rules={[{ required: true }]}>
          <Select options={ALERT_OPERATORS.map((o) => ({ label: o.label, value: o.value }))} placeholder="Select operator" />
        </Form.Item>

        <Form.Item name="threshold" label="Threshold" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} placeholder="e.g., 0.05" />
        </Form.Item>

        <Form.Item name="durationMinutes" label="Duration (minutes)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g., 5" />
        </Form.Item>

        <Form.Item
          name="runbookUrl"
          label="Runbook URL"
          rules={[{ type: 'url', message: 'Enter a valid URL' }]}
        >
          <Input placeholder="https://wiki.example.com/runbooks/high-error-rate" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
