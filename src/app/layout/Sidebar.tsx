import { Layers, LogOut, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { getDomainNavigationItems } from '@/app/registry/domainRegistry';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui';
import { ROUTES } from '@/shared/constants/routes';

import { useSidebarCollapsed, useTheme, useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarCollapsed = useSidebarCollapsed();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const theme = useTheme();
  const logout = useAuthStore((state) => state.logout);

  const staticNavEntries = useMemo(
    () =>
      getDomainNavigationItems().map((entry) => ({
        path: entry.path,
        label: entry.label,
        group: entry.group,
        iconNode: <entry.icon size={18} />,
      })),
    []
  );

  const navEntries = staticNavEntries;

  const observeItems = useMemo(
    () => navEntries.filter((entry) => entry.group === 'observe'),
    [navEntries]
  );

  const operateItems = useMemo(
    () => navEntries.filter((entry) => entry.group === 'operate'),
    [navEntries]
  );

  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/errors')) return ROUTES.overview;
    const matchedEntry = navEntries.find(
      (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`)
    );
    return matchedEntry?.path || pathname;
  };

  const selectedKey = getSelectedKey();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate({ to: ROUTES.login as any });
  };

  const navItemClass = (isActive: boolean, extra?: string) =>
    cn(
      'flex w-full items-center gap-[var(--space-sm)] whitespace-nowrap rounded-[var(--card-radius)] border border-transparent bg-transparent px-[var(--space-sm)] py-2 text-left text-[13px] font-medium text-[var(--text-secondary)] transition-[background-color,border-color,color,box-shadow]',
      'hover:bg-white/5 hover:text-[var(--text-primary)]',
      isActive &&
        'bg-[var(--color-primary-subtle-12)] text-[var(--text-primary)] border-[var(--color-primary-subtle-20)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-subtle-14)]',
      sidebarCollapsed && 'justify-center px-[7px]',
      extra
    );

  const renderNavGroup = (label: string, items: typeof observeItems) => (
    <div className="mb-[var(--space-xs)]" key={label}>
      {!sidebarCollapsed && (
        <div className="text-[9px] text-[var(--text-caption,var(--text-muted))] uppercase tracking-[0.7px] font-semibold px-[var(--space-xs)] pb-[var(--space-2xs)] pt-[var(--space-xs)] leading-[22px]">
          {label}
        </div>
      )}
      {items.map((item) => {
        const isActive = selectedKey === item.path;
        const button = (
          <button
            key={item.path}
            className={navItemClass(isActive)}
            onClick={() => navigate({ to: item.path as any })}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="inline-flex items-center shrink-0">{item.iconNode}</span>
            {!sidebarCollapsed && (
              <span className="overflow-hidden text-ellipsis">{item.label}</span>
            )}
          </button>
        );

        if (sidebarCollapsed) {
          return (
            <Tooltip key={item.path} content={item.label} placement="right">
              {button}
            </Tooltip>
          );
        }
        return button;
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed bottom-0 left-0 top-0 z-[100] flex h-screen w-[var(--space-sidebar-w,220px)] flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[var(--shadow-md)] transition-[width] duration-200',
        sidebarCollapsed && 'w-[var(--space-sidebar-collapsed,56px)]'
      )}
      data-theme={theme === 'light' ? 'light' : undefined}
    >
      <div
        className={cn(
          'flex h-[var(--space-header-h,56px)] shrink-0 cursor-pointer items-center justify-center gap-3 border-b border-[var(--border-color)] px-[var(--space-lg)]',
          sidebarCollapsed && 'px-0'
        )}
        onClick={() => navigate({ to: ROUTES.overview })}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[calc(var(--card-radius)+1px)] bg-[linear-gradient(180deg,var(--color-primary),#7266ee)] text-white shadow-[var(--shadow-sm)]">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && (
          <span className="text-[14px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
            Optikk
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <nav
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-[var(--space-xs)]"
          aria-label="Main navigation"
        >
          {renderNavGroup('Observe', observeItems)}
          {renderNavGroup('Operate', operateItems)}
        </nav>

        <div className="shrink-0 border-t border-[var(--border-color)]">
          <div className="p-[var(--space-xs)]">
            <button
              className={cn(
                'mb-[var(--space-xs)] flex w-full items-center gap-[var(--space-xs)] rounded-[var(--card-radius)] border px-[var(--space-sm)] py-2 text-left text-[12px] font-medium transition-[background-color,border-color,color,box-shadow]',
                'border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-12)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle-18)]',
                sidebarCollapsed && 'justify-center px-1.5'
              )}
              onClick={() => navigate({ to: ROUTES.settings as any })}
            >
              <Settings size={14} />
              {!sidebarCollapsed && 'Settings'}
            </button>
            <button
              className={cn(
                'flex w-full items-center gap-[var(--space-xs)] rounded-[var(--card-radius)] px-[var(--space-sm)] py-2 text-left text-[12px] font-medium transition-[background-color,border-color,color]',
                'text-[var(--text-secondary)] border border-[var(--border-light)] bg-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)]',
                sidebarCollapsed && 'justify-center px-1.5'
              )}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>

          <button
            className="flex h-10 w-full items-center justify-center border-none border-t border-[var(--border-color)] bg-transparent text-[var(--text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
