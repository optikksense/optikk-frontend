import { Select, Tag } from 'antd';
import { Variable } from 'lucide-react';
import { useVariableOptions } from '@hooks/useTemplateVariables';
import { useAppStore } from '@store/appStore';
import './TemplateVariableBar.css';

/**
 * Renders a horizontal bar of template variable dropdowns.
 *
 * @param {Array} variables - Variable definitions with currentValue
 * @param {Object} values - Current variable values { name: value }
 * @param {Function} onChange - (name, value) => void
 */
export default function TemplateVariableBar({ variables = [], values = {}, onChange }) {
  if (!variables || variables.length === 0) return null;

  return (
    <div className="template-variable-bar">
      <Variable size={14} className="template-variable-icon" />
      {variables.map((v) => (
        <VariableDropdown
          key={v.name}
          variable={v}
          value={values[v.name] ?? v.defaultValue ?? '*'}
          onChange={(val) => onChange(v.name, val)}
        />
      ))}
    </div>
  );
}

function VariableDropdown({ variable, value, onChange }) {
  const { selectedTeamId, timeRange } = useAppStore();

  // For query-type variables, fetch options dynamically
  const queryOptions = useVariableOptions(
    variable.type === 'query' ? variable : null,
    selectedTeamId,
    null,
    null
  );

  // Build options list
  const options = [];
  if (variable.includeAll) {
    options.push({ value: '*', label: 'All' });
  }

  if (variable.type === 'custom' && variable.values) {
    for (const v of variable.values) {
      options.push({ value: v.value, label: v.label || v.value });
    }
  } else if (variable.type === 'query') {
    for (const opt of queryOptions) {
      options.push(opt);
    }
  }

  return (
    <div className="template-variable-item">
      <Tag className="template-variable-label">{variable.label || variable.name}</Tag>
      <Select
        size="small"
        value={value}
        onChange={onChange}
        options={options}
        style={{ minWidth: 140 }}
        showSearch
        optionFilterProp="label"
        mode={variable.multiSelect ? 'multiple' : undefined}
        placeholder={`Select ${variable.label || variable.name}`}
      />
    </div>
  );
}
