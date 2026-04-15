import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight, Layers, LogOut, Settings } from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";

import { getDomainNavigationItems } from "@/app/registry/domainRegistry";
import { Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import { useAppStore, useSidebarCollapsed, useTheme } from "@store/appStore";
import { useAuthStore } from "@store/authStore";

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
    () => navEntries.filter((entry) => entry.group === "observe"),
    [navEntries]
  );

  const operateItems = useMemo(
    () => navEntries.filter((entry) => entry.group === "operate"),
    [navEntries]
  );

  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname.startsWith("/errors")) return ROUTES.overview;
    const matchedEntry = navEntries.find(
      (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`)
    );
    return matchedEntry?.path || pathname;
  };

  const selectedKey = getSelectedKey();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate(dynamicNavigateOptions(ROUTES.login));
  };

  const navItemClass = (isActive: boolean, extra?: string) =>
    cn(
      "flex w-full items-center gap-[var(--space-sm)] whitespace-nowrap rounded-[var(--card-radius)] border border-transparent bg-transparent px-[var(--space-sm)] py-2 text-left font-medium text-[13px] text-[var(--text-secondary)] transition-[background-color,border-color,color,box-shadow]",
      "hover:bg-white/5 hover:text-[var(--text-primary)]",
      isActive &&
        "border-[var(--color-primary-subtle-20)] bg-[var(--color-primary-subtle-12)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-subtle-14)]",
      sidebarCollapsed && "justify-center px-[7px]",
      extra
    );

  const renderNavGroup = (label: string, items: typeof observeItems) => (
    <div className="mb-[var(--space-xs)]" key={label}>
      {!sidebarCollapsed && (
        <div className="px-[var(--space-xs)] pt-[var(--space-xs)] pb-[var(--space-2xs)] font-semibold text-[9px] text-[var(--text-caption,var(--text-muted))] uppercase leading-[22px] tracking-[0.7px]">
          {label}
        </div>
      )}
      {items.map((item) => {
        const isActive = selectedKey === item.path;
        const button = (
          <button
            type="button"
            key={item.path}
            className={navItemClass(isActive)}
            onClick={() => navigate(dynamicNavigateOptions(item.path))}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="inline-flex shrink-0 items-center">{item.iconNode}</span>
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
        "fixed top-0 bottom-0 left-0 z-[100] flex h-screen w-[var(--space-sidebar-w,220px)] flex-col border-[var(--border-color)] border-r bg-[var(--bg-secondary)] shadow-[var(--shadow-md)] transition-[width] duration-200",
        sidebarCollapsed && "w-[var(--space-sidebar-collapsed,56px)]"
      )}
      data-theme={theme === "light" ? "light" : undefined}
    >
      <div
        className={cn(
          "flex h-[var(--space-header-h,56px)] shrink-0 cursor-pointer items-center justify-center gap-3 border-[var(--border-color)] border-b px-[var(--space-lg)]",
          sidebarCollapsed && "px-0"
        )}
        onClick={() => navigate({ to: ROUTES.overview })}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[calc(var(--card-radius)+1px)] bg-[linear-gradient(180deg,var(--color-primary),#7266ee)] text-white shadow-[var(--shadow-sm)]">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && (
          <span className="whitespace-nowrap font-semibold text-[14px] text-[var(--text-primary)]">
            Optikk
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <nav
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-[var(--space-xs)]"
          aria-label="Main navigation"
        >
          {renderNavGroup("Observe", observeItems)}
          {renderNavGroup("Operate", operateItems)}
        </nav>

        <div className="shrink-0 border-[var(--border-color)] border-t">
          <div className="p-[var(--space-xs)]">
            <button
              type="button"
              className={cn(
                "mb-[var(--space-xs)] flex w-full items-center gap-[var(--space-xs)] rounded-[var(--card-radius)] border px-[var(--space-sm)] py-2 text-left font-medium text-[12px] transition-[background-color,border-color,color,box-shadow]",
                "border-[var(--color-primary-subtle-28)] bg-[var(--color-primary-subtle-12)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle-18)]",
                sidebarCollapsed && "justify-center px-1.5"
              )}
              onClick={() => navigate(dynamicNavigateOptions(ROUTES.settings))}
            >
              <Settings size={14} />
              {!sidebarCollapsed && "Settings"}
            </button>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-[var(--space-xs)] rounded-[var(--card-radius)] px-[var(--space-sm)] py-2 text-left font-medium text-[12px] transition-[background-color,border-color,color]",
                "border border-[var(--border-light)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                sidebarCollapsed && "justify-center px-1.5"
              )}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              {!sidebarCollapsed && "Logout"}
            </button>
          </div>

          <button
            type="button"
            className="flex h-10 w-full items-center justify-center border-[var(--border-color)] border-t border-none bg-transparent text-[var(--text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
