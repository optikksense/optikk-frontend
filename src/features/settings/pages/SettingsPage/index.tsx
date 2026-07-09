import { Tabs } from "@/components/ui";
import { Settings, Users, UsersRound } from "lucide-react";
import { useState } from "react";

import { PageHeader, PageShell } from "@shared/components/ui";

import { SettingsMembersTab, SettingsTenantTab } from "../../components/tabs";

import { useAuthStore } from "@store/authStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Settings page. The Members tab is admin-only (tenant-scoped role).
 */
export default function SettingsPage() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("tenant");

  const { tenant } = useAuthStore(
    useShallow((s) => ({
      tenant: s.tenant,
    }))
  );

  const isAdmin = tenant?.role === "admin";
  const tenants = tenant ? [{ name: tenant.name, apiKey: null, role: tenant.role ?? null }] : [];

  const tabItems = [
    { key: "tenant", label: "Tenant", icon: <Users size={14} /> },
    ...(isAdmin ? [{ key: "members", label: "Members", icon: <UsersRound size={14} /> }] : []),
  ];

  // Guard against a stale selection if the user is not an admin.
  const active = activeSettingsTab === "members" && !isAdmin ? "tenant" : activeSettingsTab;

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs activeKey={active} onChange={setActiveSettingsTab} className="mt-1" items={tabItems} />

      {active === "tenant" && <SettingsTenantTab profileLoading={false} tenants={tenants} />}
      {active === "members" && isAdmin && <SettingsMembersTab />}
    </PageShell>
  );
}
