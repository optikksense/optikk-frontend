import { useState } from 'react';
import { Select, DatePicker, Space, Button, Popover } from 'antd';
import { Clock, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@store/appStore';
import { TIME_RANGES } from '@config/constants';

const { RangePicker } = DatePicker;

export default function TimeRangePicker() {
  const { timeRange, setTimeRange, setCustomTimeRange } = useAppStore();
  const [customOpen, setCustomOpen] = useState(false);
  const [customDates, setCustomDates] = useState(null);

  const options = [
    ...TIME_RANGES.map((range) => ({
      label: (
        <div className="time-range-option">
          <span>{range.label}</span>
          <span className="time-range-option-value">{range.value.toUpperCase()}</span>
        </div>
      ),
      value: range.value,
    })),
    {
      label: (
        <div className="time-range-option">
          <span>Custom Range</span>
          <Calendar size={12} style={{ opacity: 0.5 }} />
        </div>
      ),
      value: 'custom',
    },
  ];

  const handleChange = (value) => {
    if (value === 'custom') {
      setCustomOpen(true);
      return;
    }
    const selected = TIME_RANGES.find((r) => r.value === value);
    if (selected) {
      setTimeRange(selected);
    }
  };

  const handleCustomApply = () => {
    if (customDates && customDates[0] && customDates[1]) {
      const startTime = customDates[0].valueOf();
      const endTime = customDates[1].valueOf();
      const diffMin = Math.round((endTime - startTime) / 60000);
      setCustomTimeRange({
        label: `${customDates[0].format('MMM DD HH:mm')} – ${customDates[1].format('MMM DD HH:mm')}`,
        value: 'custom',
        minutes: diffMin,
        startTime,
        endTime,
      });
      setCustomOpen(false);
      setCustomDates(null);
    }
  };

  const customContent = (
    <div style={{ padding: 4 }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        Select start and end time
      </div>
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        value={customDates}
        onChange={setCustomDates}
        presets={[
          { label: 'Today', value: [dayjs().startOf('day'), dayjs()] },
          { label: 'Yesterday', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
          { label: 'Last 3 days', value: [dayjs().subtract(3, 'day'), dayjs()] },
          { label: 'This week', value: [dayjs().startOf('week'), dayjs()] },
        ]}
        style={{ width: '100%' }}
      />
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button size="small" onClick={() => { setCustomOpen(false); setCustomDates(null); }}>
          Cancel
        </Button>
        <Button size="small" type="primary" onClick={handleCustomApply} disabled={!customDates}>
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <Space size={4}>
      <Select
        value={timeRange.value === 'custom' ? 'custom' : timeRange.value}
        onChange={handleChange}
        options={options}
        style={{ width: 220 }}
        className="time-range-select"
        popupClassName="time-range-dropdown"
        suffixIcon={<Clock size={14} />}
        placement="bottomLeft"
      />
      {timeRange.value === 'custom' && timeRange.label && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {timeRange.label}
        </span>
      )}
      <Popover
        content={customContent}
        title="Custom Time Range"
        trigger="click"
        open={customOpen}
        onOpenChange={setCustomOpen}
        placement="bottomRight"
      >
        <Button
          size="small"
          icon={<Calendar size={14} />}
          style={{ display: 'flex', alignItems: 'center' }}
          title="Custom range"
        />
      </Popover>
    </Space>
  );
}
