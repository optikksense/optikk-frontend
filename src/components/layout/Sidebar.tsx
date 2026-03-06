import { useQuery } from '@tanstack/react-query';
import { Layout, Menu, Badge, Button, Tooltip } from 'antd';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Server,
  Bell,
  BarChart3,
  Layers,
  HardDrive,
  Settings,
  Gauge,
  Brain,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import './Sidebar.css';

const { Sider } = Layout;

/**
 *
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, selectedTeamId } = useAppStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const currentTeam = (user?.teams || []).find((t) => t.id === selectedTeamId);

  const observeItems = [
    {
      key: '/overview',
      icon: <LayoutDashboard size={18} />,
      label: 'Overview',
    },
    {
      key: '/metrics',
      icon: <BarChart3 size={18} />,
      label: 'Metrics',
    },
    {
      key: '/logs',
      icon: <FileText size={18} />,
      label: 'Logs',
    },
    {
      key: '/traces',
      icon: <GitBranch size={18} />,
      label: 'Traces',
    },
    {
      key: '/services',
      icon: <Server size={18} />,
      label: 'Services',
    },
  ];

  const operateItems = [
    {
      key: '/infrastructure',
      icon: <HardDrive size={18} />,
      label: 'Infrastructure',
    },
    {
      key: '/saturation',
      icon: <Gauge size={18} />,
      label: 'Saturation',
    },
    {
      key: '/ai-observability',
      icon: <Brain size={18} />,
      label: 'AI Observability',
    },
  ];

  const mainMenuItems = [
    {
      key: 'observe-group',
      type: 'group' as const,
      label: !sidebarCollapsed ? <span className="sidebar-group-title">Observe</span> : '',
      children: observeItems,
    },
    {
      key: 'operate-group',
      type: 'group' as const,
      label: !sidebarCollapsed ? <span className="sidebar-group-title">Operate</span> : '',
      children: operateItems,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Match nested routes to their parent for selected key
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/services/')) return '/services';
    if (path.startsWith('/traces/')) return '/traces';
    if (path.startsWith('/errors')) return '/overview';
    if (path.startsWith('/deployments')) return '/infrastructure';
    if (path.startsWith('/latency')) return '/metrics';
    return path;
  };

  return (
    <Sider
      className="app-sidebar"
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      collapsible
      width={240}
      collapsedWidth={64}
      theme={theme === 'light' ? 'light' : 'dark'}
    >
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && <span className="logo-text">Optikk</span>}
      </div>

      {!sidebarCollapsed && (
        <div className="sidebar-context-strip">
          <div className="sidebar-context-badge">Enterprise</div>
          <div className="sidebar-context-team">{currentTeam?.name || `Workspace #${selectedTeamId}`}</div>
        </div>
      )}

      <div className="sidebar-menu-container">
        <div className="sidebar-nav-scroll">
          <Menu
            theme={theme === 'light' ? 'light' : 'dark'}
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={mainMenuItems}
            onClick={handleMenuClick}
            className="sidebar-menu"
          />
        </div>

        <div className="sidebar-bottom-menu">
          <div className="sidebar-quick-actions">
            <Button
              data-testid="sidebar-settings"
              type="text"
              className="sidebar-settings-btn"
              icon={<Settings size={14} />}
              onClick={() => navigate('/settings')}
            >
              {!sidebarCollapsed && 'Settings'}
            </Button>

            <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} placement="right">
              <Button
                data-testid="sidebar-theme-toggle"
                type="text"
                className="sidebar-theme-btn"
                icon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                onClick={toggleTheme}
              >
                {!sidebarCollapsed && (theme === 'dark' ? 'Light Theme' : 'Dark Theme')}
              </Button>
            </Tooltip>

            <Button
              data-testid="sidebar-logout"
              type="text"
              className="sidebar-logout-btn"
              icon={<LogOut size={14} />}
              onClick={handleLogout}
            >
              {!sidebarCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </Sider>
  );
}
