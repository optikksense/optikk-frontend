import { useState } from 'react';
import { Button, Input, Space, Card, Form, Collapse } from 'antd';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Edits the dashboard-level dataSources[] array.
 * Each data source has: id, endpoint, params (key-value pairs).
 */
export default function DataSourceEditor({ dataSources = [], onChange }) {
  const handleAdd = () => {
    onChange([...dataSources, { id: '', endpoint: '', params: {} }]);
  };

  const handleRemove = (index) => {
    onChange(dataSources.filter((_, i) => i !== index));
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...dataSources];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleParamChange = (dsIndex, paramKey, paramValue) => {
    const updated = [...dataSources];
    const params = { ...updated[dsIndex].params };
    if (paramValue === '' || paramValue === undefined) {
      delete params[paramKey];
    } else {
      params[paramKey] = paramValue;
    }
    updated[dsIndex] = { ...updated[dsIndex], params };
    onChange(updated);
  };

  const handleAddParam = (dsIndex) => {
    const updated = [...dataSources];
    const params = { ...updated[dsIndex].params, '': '' };
    updated[dsIndex] = { ...updated[dsIndex], params };
    onChange(updated);
  };

  const handleRenameParam = (dsIndex, oldKey, newKey) => {
    const updated = [...dataSources];
    const params = { ...updated[dsIndex].params };
    const val = params[oldKey];
    delete params[oldKey];
    params[newKey] = val;
    updated[dsIndex] = { ...updated[dsIndex], params };
    onChange(updated);
  };

  const handleRemoveParam = (dsIndex, paramKey) => {
    const updated = [...dataSources];
    const params = { ...updated[dsIndex].params };
    delete params[paramKey];
    updated[dsIndex] = { ...updated[dsIndex], params };
    onChange(updated);
  };

  const collapseItems = dataSources.map((ds, index) => ({
    key: String(index),
    label: ds.id || `Data Source ${index + 1}`,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Input
          size="small"
          addonBefore="ID"
          value={ds.id}
          onChange={(e) => handleUpdate(index, 'id', e.target.value)}
          placeholder="metrics-summary"
        />
        <Input
          size="small"
          addonBefore="Endpoint"
          value={ds.endpoint}
          onChange={(e) => handleUpdate(index, 'endpoint', e.target.value)}
          placeholder="/v1/metrics/summary"
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted, #888)' }}>Params</span>
            <Button type="link" size="small" icon={<Plus size={10} />} onClick={() => handleAddParam(index)}>
              Add
            </Button>
          </div>
          {Object.entries(ds.params || {}).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <Input
                size="small"
                value={key}
                onChange={(e) => handleRenameParam(index, key, e.target.value)}
                placeholder="key"
                style={{ flex: 1 }}
              />
              <Input
                size="small"
                value={value}
                onChange={(e) => handleParamChange(index, key, e.target.value)}
                placeholder="value"
                style={{ flex: 1 }}
              />
              <Button
                type="text"
                size="small"
                icon={<Trash2 size={10} />}
                onClick={() => handleRemoveParam(index, key)}
                danger
              />
            </div>
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <div>
      {dataSources.length > 0 && (
        <Collapse items={collapseItems} size="small" />
      )}
      <Button
        type="dashed"
        size="small"
        icon={<Plus size={12} />}
        onClick={handleAdd}
        style={{ marginTop: 8, width: '100%' }}
      >
        Add Data Source
      </Button>
    </div>
  );
}
