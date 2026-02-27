import { Layout, Space, Select, Button, Tooltip } from 'antd';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';
import TimeRangePicker from '@components/common/forms/TimeRangePicker';
import { AUTO_REFRESH_INTERVALS } from '@config/constants';
import toast from 'react-hot-toast';
import './Header.css';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { user } = useAuthStore();
  const { selectedTeamId, setSelectedTeamId, triggerRefresh, autoRefreshInterval, setAutoRefreshInterval } = useAppStore();
  const [lastRefreshAt, setLastRefreshAt] = useState(Date.now());
  const [intervalPickerOpen, setIntervalPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleRefresh = () => {
    triggerRefresh();
    setLastRefreshAt(Date.now());
    toast.success('Data refreshed');
  };

  // Tick every second for the "Xs ago" label
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh timer — fires triggerRefresh on the configured interval
  useEffect(() => {
    if (!autoRefreshInterval) return;
    const id = setInterval(() => {
      triggerRefresh();
      setLastRefreshAt(Date.now());
    }, autoRefreshInterval);
    return () => clearInterval(id);
  }, [autoRefreshInterval, triggerRefresh]);

  // Close interval picker on outside click
  useEffect(() => {
    if (!intervalPickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIntervalPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [intervalPickerOpen]);

  const refreshLabel = (() => {
    const diffSeconds = Math.max(0, Math.floor((now - lastRefreshAt) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const mins = Math.floor(diffSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  })();

  const activeInterval = AUTO_REFRESH_INTERVALS.find((o) => o.value === autoRefreshInterval) || AUTO_REFRESH_INTERVALS[0];

  // Get teams from user data
  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.orgName ? `${team.orgName} / ${team.name}` : team.name,
    value: team.id,
  }));

  return (
    <AntHeader className="app-header">
      <Space size="middle" className="header-left">
        <div className="header-range-wrap">
          <span className="header-range-label">Time Window</span>
          <TimeRangePicker />
        </div>
      </Space>

      <Space size="middle" className="header-right">
        {teams.length > 0 && (
          <div className="header-team-wrap">
            <span className="header-team-label">Workspace</span>
            <Select
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              options={teamOptions}
              style={{ width: 220 }}
              placeholder="Select team"
            />
          </div>
        )}

        {/* Refresh button + interval picker */}
        <div className="header-refresh-wrap" ref={pickerRef}>
          <Tooltip title="Refresh now">
            <Button
              icon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              type="text"
              className="header-refresh-btn"
            >
              <span>Refresh</span>
              <span className="header-refresh-meta">{refreshLabel}</span>
            </Button>
          </Tooltip>

          <Tooltip title="Auto-refresh interval">
            <button
              className={`header-autorefresh-pill ${autoRefreshInterval ? 'header-autorefresh-pill--active' : ''}`}
              onClick={() => setIntervalPickerOpen((v) => !v)}
            >
              {activeInterval.value ? (
                <span className="header-autorefresh-dot" />
              ) : null}
              {activeInterval.label}
              <ChevronDown size={11} />
            </button>
          </Tooltip>

          {intervalPickerOpen && (
            <div className="header-autorefresh-dropdown">
              {AUTO_REFRESH_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  className={`header-autorefresh-option ${opt.value === autoRefreshInterval ? 'header-autorefresh-option--active' : ''}`}
                  onClick={() => {
                    setAutoRefreshInterval(opt.value);
                    setIntervalPickerOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </Space>
    </AntHeader>
  );
}
