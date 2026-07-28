import { Tabs } from "@shared/components/primitives/ui";
import { Settings, Terminal, User, Users, UsersRound } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";

import {
  SettingsInstrumentationTab,
  SettingsMembersTab,
  SettingsProfileTab,
  SettingsTenantTab,
} from "../../components/tabs";
import { type SettingsTab, useSettingsTab } from "./useSettingsTab";

import { useAuthStore } from "@app/store/authStore";
import { useShallow } from "zustand/react/shallow";

export default function SettingsPage() {
  const { tab, setTab } = useSettingsTab();

  const { tenant } = useAuthStore(
    useShallow((s) => ({
      tenant: s.tenant,
    }))
  );

  const isAdmin = tenant?.role === "admin";
  const tenants = tenant ? [{ name: tenant.name, role: tenant.role ?? null }] : [];

  const tabItems = [
    { key: "profile", label: "Profile", icon: <User size={14} /> },
    { key: "tenant", label: "Tenant", icon: <Users size={14} /> },
    { key: "instrumentation", label: "Instrumentation", icon: <Terminal size={14} /> },
    ...(isAdmin ? [{ key: "members", label: "Members", icon: <UsersRound size={14} /> }] : []),
  ];

  const active = tab === "members" && !isAdmin ? "tenant" : tab;

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs
        activeKey={active}
        onChange={(key) => setTab(key as SettingsTab)}
        className="mt-1"
        items={tabItems}
      />

      {active === "profile" && <SettingsProfileTab />}
      {active === "tenant" && (
        <SettingsTenantTab profileLoading={false} tenants={tenants} isAdmin={isAdmin} />
      )}
      {active === "instrumentation" && <SettingsInstrumentationTab />}
      {active === "members" && isAdmin && <SettingsMembersTab />}
    </PageShell>
  );
}
