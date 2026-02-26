import { useState, useEffect } from 'react';
import { Drawer, Tabs, Form, Input, Select, InputNumber, Switch, Button, Space, ColorPicker } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import './PanelEditor.css';

const CHART_TYPES = [
  { value: 'request', label: 'Request Rate' },
  { value: 'error-rate', label: 'Error Rate' },
  { value: 'latency', label: 'Latency' },
  { value: 'log-histogram', label: 'Log Histogram' },
  { value: 'latency-histogram', label: 'Latency Histogram' },
  { value: 'latency-heatmap', label: 'Latency Heatmap' },
  { value: 'ai-line', label: 'AI Line Chart' },
  { value: 'ai-bar', label: 'AI Bar Chart' },
];

const GROUP_BY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'service', label: 'Service' },
  { value: 'endpoint', label: 'Endpoint' },
  { value: 'pod', label: 'Pod' },
  { value: 'queue', label: 'Queue' },
];

const ENDPOINT_LIST_TYPES = [
  { value: '', label: 'None' },
  { value: 'requests', label: 'Requests' },
  { value: 'errorRate', label: 'Error Rate' },
  { value: 'latency', label: 'Latency' },
];

const COL_OPTIONS = [
  { value: 6, label: '1/4 Width (6)' },
  { value: 8, label: '1/3 Width (8)' },
  { value: 12, label: '1/2 Width (12)' },
  { value: 16, label: '2/3 Width (16)' },
  { value: 24, label: 'Full Width (24)' },
];

export default function PanelEditor({ open, panelConfig, dataSources = [], onSave, onCancel }) {
  const [form] = Form.useForm();
  const [thresholds, setThresholds] = useState(panelConfig?.thresholds || []);

  useEffect(() => {
    if (panelConfig) {
      form.setFieldsValue({
        title: panelConfig.title || '',
        type: panelConfig.type || 'request',
        height: panelConfig.height || 280,
        dataSource: panelConfig.dataSource || '',
        valueKey: panelConfig.valueKey || '',
        groupByKey: panelConfig.groupByKey || '',
        dataKey: panelConfig.dataKey || '',
        endpointDataSource: panelConfig.endpointDataSource || '',
        endpointMetricsSource: panelConfig.endpointMetricsSource || '',
        endpointListType: panelConfig.endpointListType || '',
        listTitle: panelConfig.listTitle || '',
        color: panelConfig.color || '',
        yPrefix: panelConfig.yPrefix || '',
        yDecimals: panelConfig.yDecimals ?? undefined,
        datasetLabel: panelConfig.datasetLabel || '',
        stacked: panelConfig.stacked || false,
        targetThreshold: panelConfig.targetThreshold ?? undefined,
        col: panelConfig.layout?.col || 12,
      });
      setThresholds(panelConfig.thresholds || []);
    }
  }, [panelConfig, form]);

  const dataSourceOptions = dataSources.map((ds) => ({
    value: ds.id,
    label: ds.id,
  }));

  const handleFinish = (values) => {
    const updates = {
      title: values.title,
      type: values.type,
      height: values.height,
      dataSource: values.dataSource || undefined,
      valueKey: values.valueKey || undefined,
      groupByKey: values.groupByKey || undefined,
      dataKey: values.dataKey || undefined,
      endpointDataSource: values.endpointDataSource || undefined,
      endpointMetricsSource: values.endpointMetricsSource || undefined,
      endpointListType: values.endpointListType || undefined,
      listTitle: values.listTitle || undefined,
      color: values.color || undefined,
      yPrefix: values.yPrefix || undefined,
      yDecimals: values.yDecimals ?? undefined,
      datasetLabel: values.datasetLabel || undefined,
      stacked: values.stacked || undefined,
      targetThreshold: values.targetThreshold ?? undefined,
      layout: { col: values.col || 12 },
      thresholds: thresholds.length > 0 ? thresholds : undefined,
    };

    // Remove undefined keys
    for (const key of Object.keys(updates)) {
      if (updates[key] === undefined) delete updates[key];
    }

    onSave(updates);
  };

  const addThreshold = () => {
    setThresholds([...thresholds, { value: 0, color: '#F04438' }]);
  };

  const removeThreshold = (index) => {
    setThresholds(thresholds.filter((_, i) => i !== index));
  };

  const updateThreshold = (index, field, value) => {
    const updated = [...thresholds];
    updated[index] = { ...updated[index], [field]: value };
    setThresholds(updated);
  };

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Chart Type" name="type" rules={[{ required: true }]}>
            <Select options={CHART_TYPES} />
          </Form.Item>
          <Form.Item label="Height (px)" name="height">
            <InputNumber min={100} max={800} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Column Span" name="col">
            <Select options={COL_OPTIONS} />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'data',
      label: 'Data',
      children: (
        <>
          <Form.Item label="Data Source" name="dataSource">
            <Select options={dataSourceOptions} allowClear placeholder="Select a data source" />
          </Form.Item>
          <Form.Item label="Value Key" name="valueKey">
            <Input placeholder="e.g. request_count, avg_latency" />
          </Form.Item>
          <Form.Item label="Group By" name="groupByKey">
            <Select options={GROUP_BY_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item label="Nested Data Key" name="dataKey">
            <Input placeholder="e.g. timeseries, topQueues" />
          </Form.Item>
          <Form.Item label="Endpoint Data Source" name="endpointDataSource">
            <Select options={dataSourceOptions} allowClear />
          </Form.Item>
          <Form.Item label="Endpoint Metrics Source" name="endpointMetricsSource">
            <Select options={dataSourceOptions} allowClear />
          </Form.Item>
          <Form.Item label="Endpoint List Type" name="endpointListType">
            <Select options={ENDPOINT_LIST_TYPES} allowClear />
          </Form.Item>
          <Form.Item label="List Title" name="listTitle">
            <Input placeholder="e.g. Top Endpoints by Latency" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'display',
      label: 'Display',
      children: (
        <>
          <Form.Item label="Color" name="color">
            <Input placeholder="#5E60CE" addonBefore={
              <ColorPicker
                size="small"
                value={form.getFieldValue('color') || '#5E60CE'}
                onChangeComplete={(c) => form.setFieldValue('color', c.toHexString())}
              />
            } />
          </Form.Item>
          <Form.Item label="Dataset Label" name="datasetLabel">
            <Input placeholder="e.g. Requests, Error Rate" />
          </Form.Item>
          <Form.Item label="Y-Axis Prefix" name="yPrefix">
            <Input placeholder="e.g. $, %" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item label="Y-Axis Decimals" name="yDecimals">
            <InputNumber min={0} max={6} />
          </Form.Item>
          <Form.Item label="Stacked" name="stacked" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Target Threshold" name="targetThreshold">
            <InputNumber placeholder="e.g. 99.9" style={{ width: '100%' }} />
          </Form.Item>

          <div className="threshold-section">
            <div className="threshold-header">
              <span>Color Thresholds</span>
              <Button type="link" size="small" icon={<Plus size={12} />} onClick={addThreshold}>
                Add
              </Button>
            </div>
            {thresholds.map((t, i) => (
              <div key={i} className="threshold-row">
                <InputNumber
                  value={t.value}
                  onChange={(v) => updateThreshold(i, 'value', v)}
                  placeholder="Value"
                  style={{ flex: 1 }}
                  size="small"
                />
                <ColorPicker
                  size="small"
                  value={t.color}
                  onChangeComplete={(c) => updateThreshold(i, 'color', c.toHexString())}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<Trash2 size={12} />}
                  onClick={() => removeThreshold(i)}
                  danger
                />
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <Drawer
      title={`Edit Panel: ${panelConfig?.title || 'Panel'}`}
      open={open}
      onClose={onCancel}
      width={420}
      className="panel-editor-drawer"
      extra={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>Apply</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} size="small">
        <Tabs items={tabItems} size="small" />
      </Form>
    </Drawer>
  );
}
