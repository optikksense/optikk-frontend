import { Space, Select, Input, Button } from 'antd';
import { Search, Download } from 'lucide-react';
import './FilterBar.css';

/**
 * Reusable filter toolbar with search, dropdowns, and action buttons.
 * Replaces the duplicated Space/Select/Search patterns across pages.
 *
 * @param {Array} filters - Array of filter configs:
 *   { type: 'search', key, placeholder, onSearch, width }
 *   { type: 'select', key, placeholder, options, value, onChange, width, allowClear }
 * @param {ReactNode} actions - Optional action buttons (e.g. Export, Create)
 */
export default function FilterBar({ filters = [], actions }) {
  return (
    <div className="filter-bar">
      <Space wrap>
        {filters.map((filter) => {
          if (filter.type === 'search') {
            return (
              <Input.Search
                key={filter.key}
                placeholder={filter.placeholder || 'Search...'}
                onSearch={filter.onSearch}
                onChange={filter.onChange}
                style={{ width: filter.width || 300 }}
                prefix={<Search size={16} />}
                allowClear
              />
            );
          }

          if (filter.type === 'select') {
            return (
              <Select
                key={filter.key}
                placeholder={filter.placeholder}
                style={{ width: filter.width || 160 }}
                allowClear={filter.allowClear !== false}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
              />
            );
          }

          return null;
        })}
      </Space>

      {actions && <div className="filter-bar-actions">{actions}</div>}
    </div>
  );
}
