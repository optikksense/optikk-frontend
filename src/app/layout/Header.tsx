import { Layout, Space, Select, Button, Tooltip } from 'antd';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { TimeRangePicker } from '@shared/components/ui/TimeSelector';

import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { AUTO_REFRESH_INTERVALS } from '@config/constants';

import './Header.css';

const { Header: AntHeader } = Layout;

/**
 *
 */
export default function Header() {
  const { user } = useAuthStore();
  const { selectedTeamIds, setSelectedTeamIds, triggerRefresh, autoRefreshInterval, setAutoRefreshInterval } = useAppStore();
  const [intervalPickerOpen, setIntervalPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { refreshLabel, triggerRefresh: triggerHeaderRefresh } = useAutoRefresh({
    autoRefreshInterval,
    onRefresh: triggerRefresh,
  });

  const handleRefresh = () => {
    triggerHeaderRefresh();
    toast.success('Data refreshed');
  };

  // Close interval picker on outside click
  useEffect(() => {
    if (!intervalPickerOpen) return;
    const handler = (event: MouseEvent): void => {
      if (pickerRef.current && event.target instanceof Node && !pickerRef.current.contains(event.target)) {
        setIntervalPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [intervalPickerOpen]);

  const activeInterval = AUTO_REFRESH_INTERVALS.find((o) => o.value === autoRefreshInterval) || AUTO_REFRESH_INTERVALS[0];

  // Get teams from user data
  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.orgName ? `${team.orgName} / ${team.name}` : team.name,
    value: team.id,
  }));

  const teamSelectLabel = (() => {
    if (selectedTeamIds.length === 0) return 'Select team';
    if (selectedTeamIds.length === 1) {
      const team = teams.find((t) => t.id === selectedTeamIds[0]);
      return team ? (team.orgName ? `${team.orgName} / ${team.name}` : team.name) : 'Select team';
    }
    return `${selectedTeamIds.length} teams`;
  })();

  return (
    <AntHeader className="app-header">
      <Space size="middle" className="header-left">
        <TimeRangePicker />
      </Space>

      <Space size="middle" className="header-right">
        {teams.length > 0 && (
          <div className="header-team-wrap">
            <span className="header-team-label">Workspace</span>
            <Select
              data-testid="workspace-select"
              mode="multiple"
              value={selectedTeamIds}
              onChange={setSelectedTeamIds}
              options={teamOptions}
              style={{ width: 220 }}
              placeholder="Select team"
              maxTagCount={0}
              maxTagPlaceholder={() => teamSelectLabel}
            />
          </div>
        )}

        {/* Refresh button + interval picker */}
        <div className="header-refresh-wrap" ref={pickerRef}>
          <Tooltip title="Refresh now">
            <Button
              data-testid="header-refresh"
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
              data-testid="header-autorefresh-toggle"
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
