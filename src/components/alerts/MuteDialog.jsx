import { Modal, Form, Select, Input } from 'antd';

const MUTE_DURATIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '4 hours', value: 240 },
  { label: '24 hours', value: 1440 },
  { label: '7 days', value: 10080 },
];

export default function MuteDialog({ open, onCancel, onConfirm, loading }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values.minutes, values.reason || '');
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title="Mute Alert"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
      confirmLoading={loading}
      okText="Mute"
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="minutes"
          label="Duration"
          initialValue={60}
          rules={[{ required: true, message: 'Select a duration' }]}
        >
          <Select options={MUTE_DURATIONS} />
        </Form.Item>

        <Form.Item name="reason" label="Reason (optional)">
          <Input.TextArea
            rows={3}
            placeholder="Why is this alert being muted?"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
