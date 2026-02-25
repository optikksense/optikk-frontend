import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Button, Tooltip } from 'antd';
import { useQuery } from '@tanstack/react-query';
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
  Search,
} from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';
import { alertService } from '@services/alertService';
import toast from 'react-hot-toast';
import './Sidebar.css';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, selectedTeamId } = useAppStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { data: activeCount } = useQuery({
    queryKey: ['alerts-active-count'],
    queryFn: () => alertService.getActiveAlertCount(),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const alertLabel = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      Alerts
      {activeCount > 0 && (
        <Badge count={activeCount} size="small" style={{ backgroundColor: '#F04438' }} />
      )}
    </span>
  );

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
      key: '/explore',
      icon: <Search size={18} />,
      label: 'Explore',
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
    {
      key: '/alerts',
      icon: <Bell size={18} />,
      label: alertLabel,
    },
  ];

  const mainMenuItems = [
    {
      key: 'observe-group',
      type: 'group',
      label: !sidebarCollapsed ? <span className="sidebar-group-title">Observe</span> : '',
      children: observeItems,
    },
    {
      key: 'operate-group',
      type: 'group',
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
    if (path.startsWith('/explore')) return '/explore';
    if (path.startsWith('/errors')) return '/overview';
    if (path.startsWith('/deployments')) return '/infrastructure';
    if (path.startsWith('/health-checks')) return '/infrastructure';
    if (path.startsWith('/incidents')) return '/alerts';
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
        {!sidebarCollapsed && <span className="logo-text">ObserveX</span>}
      </div>

      {!sidebarCollapsed && (
        <div className="sidebar-context-strip">
          <div className="sidebar-context-badge">Enterprise</div>
          <div className="sidebar-context-team">Workspace #{selectedTeamId}</div>
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
              type="text"
              className="sidebar-settings-btn"
              icon={<Settings size={14} />}
              onClick={() => navigate('/settings')}
            >
              {!sidebarCollapsed && 'Settings'}
            </Button>

            <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} placement="right">
              <Button
                type="text"
                className="sidebar-theme-btn"
                icon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                onClick={toggleTheme}
              >
                {!sidebarCollapsed && (theme === 'dark' ? 'Light Theme' : 'Dark Theme')}
              </Button>
            </Tooltip>

            <Button
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
