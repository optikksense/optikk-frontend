import { Space, Select, Input } from 'antd';
import { Search } from 'lucide-react';
import { ReactNode } from 'react';
import './FilterBar.css';

interface FilterSearchConfig {
  type: 'search';
  key: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  width?: number;
}

interface FilterSelectConfig {
  type: 'select';
  key: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  width?: number;
  allowClear?: boolean;
}

type FilterConfig = FilterSearchConfig | FilterSelectConfig;

interface FilterBarProps {
  filters?: FilterConfig[];
  actions?: ReactNode;
}

/**
 *
 * @param root0
 * @param root0.filters
 * @param root0.actions
 */
export default function FilterBar({ filters = [], actions }: FilterBarProps) {
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
                value={filter.value}
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
