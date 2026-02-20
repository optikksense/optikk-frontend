import { Layout, Space, Select, Button, Tooltip } from 'antd';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';
import TimeRangePicker from '@components/common/TimeRangePicker';
import toast from 'react-hot-toast';
import './Header.css';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { user } = useAuthStore();
  const { selectedTeamId, setSelectedTeamId, triggerRefresh } = useAppStore();
  const [lastRefreshAt, setLastRefreshAt] = useState(Date.now());

  const handleRefresh = () => {
    triggerRefresh();
    setLastRefreshAt(Date.now());
    toast.success('Data refreshed');
  };

  const refreshLabel = useMemo(() => {
    const diffSeconds = Math.max(0, Math.floor((Date.now() - lastRefreshAt) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const mins = Math.floor(diffSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  }, [lastRefreshAt]);

  // Get teams from user data
  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.name,
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

        <Tooltip title="Refresh Data">
          <Button icon={<RefreshCw size={16} />} onClick={handleRefresh} type="text" className="header-refresh-btn">
            <span>Refresh</span>
            <span className="header-refresh-meta">{refreshLabel}</span>
          </Button>
        </Tooltip>

      </Space>
    </AntHeader>
  );
}
