import { useState } from 'react';
import { Button, Input, Select, Switch, Space, Card, Form, Collapse, InputNumber } from 'antd';
import { Plus, Trash2 } from 'lucide-react';

const VARIABLE_TYPES = [
  { value: 'query', label: 'Query (fetched from API)' },
  { value: 'custom', label: 'Custom (static values)' },
];

/**
 * Editor for configuring template variables.
 */
export default function VariableEditor({ variables = [], onChange }) {
  const handleAdd = () => {
    onChange([
      ...variables,
      {
        name: '',
        label: '',
        type: 'custom',
        defaultValue: '*',
        includeAll: true,
        values: [],
      },
    ]);
  };

  const handleRemove = (index) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const handleUpdate = (index, updates) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleAddCustomValue = (index) => {
    const updated = [...variables];
    const vals = [...(updated[index].values || [])];
    vals.push({ label: '', value: '' });
    updated[index] = { ...updated[index], values: vals };
    onChange(updated);
  };

  const handleUpdateCustomValue = (varIndex, valIndex, field, value) => {
    const updated = [...variables];
    const vals = [...(updated[varIndex].values || [])];
    vals[valIndex] = { ...vals[valIndex], [field]: value };
    updated[varIndex] = { ...updated[varIndex], values: vals };
    onChange(updated);
  };

  const handleRemoveCustomValue = (varIndex, valIndex) => {
    const updated = [...variables];
    const vals = (updated[varIndex].values || []).filter((_, i) => i !== valIndex);
    updated[varIndex] = { ...updated[varIndex], values: vals };
    onChange(updated);
  };

  const collapseItems = variables.map((v, index) => ({
    key: String(index),
    label: v.label || v.name || `Variable ${index + 1}`,
    extra: (
      <Button
        type="text"
        size="small"
        icon={<Trash2 size={12} />}
        onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
        danger
      />
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            size="small"
            addonBefore="Name"
            value={v.name}
            onChange={(e) => handleUpdate(index, { name: e.target.value })}
            placeholder="service"
            style={{ flex: 1 }}
          />
          <Input
            size="small"
            addonBefore="Label"
            value={v.label}
            onChange={(e) => handleUpdate(index, { label: e.target.value })}
            placeholder="Service"
            style={{ flex: 1 }}
          />
        </Space.Compact>

        <Select
          size="small"
          value={v.type}
          onChange={(val) => handleUpdate(index, { type: val })}
          options={VARIABLE_TYPES}
          style={{ width: '100%' }}
        />

        <Input
          size="small"
          addonBefore="Default"
          value={v.defaultValue}
          onChange={(e) => handleUpdate(index, { defaultValue: e.target.value })}
          placeholder="*"
        />

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Switch
              size="small"
              checked={v.includeAll}
              onChange={(val) => handleUpdate(index, { includeAll: val })}
            />
            Include "All" option
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Switch
              size="small"
              checked={v.multiSelect}
              onChange={(val) => handleUpdate(index, { multiSelect: val })}
            />
            Multi-select
          </label>
        </div>

        {v.type === 'query' && (
          <Card size="small" title="Query Configuration" styles={{ body: { padding: 8 } }}>
            <Input
              size="small"
              addonBefore="Endpoint"
              value={v.query?.endpoint || ''}
              onChange={(e) => handleUpdate(index, { query: { ...v.query, endpoint: e.target.value } })}
              placeholder="/v1/services/metrics"
              style={{ marginBottom: 6 }}
            />
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="small"
                addonBefore="Value Field"
                value={v.query?.valueField || ''}
                onChange={(e) => handleUpdate(index, { query: { ...v.query, valueField: e.target.value } })}
                placeholder="service_name"
              />
              <Input
                size="small"
                addonBefore="Label Field"
                value={v.query?.labelField || ''}
                onChange={(e) => handleUpdate(index, { query: { ...v.query, labelField: e.target.value } })}
                placeholder="(same as value)"
              />
            </Space.Compact>
          </Card>
        )}

        {v.type === 'custom' && (
          <Card size="small" title="Custom Values" styles={{ body: { padding: 8 } }}>
            {(v.values || []).map((cv, vi) => (
              <div key={vi} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <Input
                  size="small"
                  value={cv.label}
                  onChange={(e) => handleUpdateCustomValue(index, vi, 'label', e.target.value)}
                  placeholder="Label"
                  style={{ flex: 1 }}
                />
                <Input
                  size="small"
                  value={cv.value}
                  onChange={(e) => handleUpdateCustomValue(index, vi, 'value', e.target.value)}
                  placeholder="Value"
                  style={{ flex: 1 }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<Trash2 size={10} />}
                  onClick={() => handleRemoveCustomValue(index, vi)}
                  danger
                />
              </div>
            ))}
            <Button
              type="dashed"
              size="small"
              icon={<Plus size={10} />}
              onClick={() => handleAddCustomValue(index)}
              style={{ width: '100%', marginTop: 4 }}
            >
              Add Value
            </Button>
          </Card>
        )}
      </div>
    ),
  }));

  return (
    <div>
      {variables.length > 0 && (
        <Collapse items={collapseItems} size="small" />
      )}
      <Button
        type="dashed"
        icon={<Plus size={12} />}
        onClick={handleAdd}
        style={{ marginTop: 12, width: '100%' }}
      >
        Add Variable
      </Button>
    </div>
  );
}
