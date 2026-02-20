import { Select } from 'antd';
import { Clock } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { TIME_RANGES } from '@config/constants';

export default function TimeRangePicker() {
  const { timeRange, setTimeRange } = useAppStore();

  const options = TIME_RANGES.map((range) => ({
    label: (
      <div className="time-range-option">
        <span>{range.label}</span>
        <span className="time-range-option-value">{range.value.toUpperCase()}</span>
      </div>
    ),
    value: range.value,
  }));

  const handleChange = (value) => {
    const selected = TIME_RANGES.find((r) => r.value === value);
    if (selected) {
      setTimeRange(selected);
    }
  };

  return (
    <Select
      value={timeRange.value}
      onChange={handleChange}
      options={options}
      style={{ width: 220 }}
      className="time-range-select"
      popupClassName="time-range-dropdown"
      suffixIcon={<Clock size={14} />}
      placement="bottomLeft"
    />
  );
}
