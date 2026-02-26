import { useState, useCallback, useRef } from 'react';
import { Input } from 'antd';
import { Search } from 'lucide-react';

/**
 * Debounced search input. Triggers onSearch after the user stops typing.
 */
export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  style,
}) {
  const [value, setValue] = useState('');
  const timerRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<Search size={16} />}
      allowClear
      style={style}
      onClear={() => onSearch?.('')}
    />
  );
}
