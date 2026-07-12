import { Tabs } from "@shared/components/primitives/ui";
import { Settings, Users, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { PageHeader, PageShell } from "@shared/components/ui";

import { SettingsMembersTab, SettingsTenantTab } from "../../components/tabs";
import { type SettingsTab, useSettingsTab } from "./useSettingsTab";

import { useAuthStore } from "@app/store/authStore";
import { useShallow } from "zustand/react/shallow";

/** A tab whose content is supplied by the route layer (e.g. Ingestion). */
export interface SettingsExtraTab {
  key: string;
  label: string;
  icon: ReactNode;
  render: () => ReactNode;
}

interface SettingsPageProps {
  extraTabs?: readonly SettingsExtraTab[];
}

/**
 * Settings page. The Members tab is admin-only (tenant-scoped role). `extraTabs`
 * lets the route layer inject cross-feature panels (e.g. Ingestion) without a
 * feature-to-feature import.
 */
export default function SettingsPage({ extraTabs = [] }: SettingsPageProps) {
  const { tab, setTab } = useSettingsTab();

  const { tenant } = useAuthStore(
    useShallow((s) => ({
      tenant: s.tenant,
    }))
  );

  const isAdmin = tenant?.role === "admin";
  const tenants = tenant ? [{ name: tenant.name, role: tenant.role ?? null }] : [];

  const tabItems = [
    { key: "tenant", label: "Tenant", icon: <Users size={14} /> },
    ...(isAdmin ? [{ key: "members", label: "Members", icon: <UsersRound size={14} /> }] : []),
    ...extraTabs.map(({ key, label, icon }) => ({ key, label, icon })),
  ];

  // Guard against a stale selection if the user is not an admin.
  const active = tab === "members" && !isAdmin ? "tenant" : tab;
  const activeExtraTab = extraTabs.find((t) => t.key === active);

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs
        activeKey={active}
        onChange={(key) => setTab(key as SettingsTab)}
        className="mt-1"
        items={tabItems}
      />

      {active === "tenant" && (
        <SettingsTenantTab profileLoading={false} tenants={tenants} isAdmin={isAdmin} />
      )}
      {active === "members" && isAdmin && <SettingsMembersTab />}
      {activeExtraTab?.render()}
    </PageShell>
  );
}
