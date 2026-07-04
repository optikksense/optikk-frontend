import { Tabs } from "@/components/ui";
import { Settings, Users } from "lucide-react";
import { useState } from "react";

import { PageHeader, PageShell } from "@shared/components/ui";

import { SettingsTenantTab } from "../../components/tabs";

import { useAuthStore } from "@store/authStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Settings page — currently shows only the tenant tab.
 */
export default function SettingsPage() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("tenant");

  const { tenant } = useAuthStore(
    useShallow((s) => ({
      tenant: s.tenant,
    }))
  );

  const tenants = tenant ? [{ name: tenant.name, apiKey: null, role: null }] : [];

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs
        activeKey={activeSettingsTab}
        onChange={setActiveSettingsTab}
        className="mt-1"
        items={[
          { key: "tenant", label: "Tenant", icon: <Users size={14} /> },
        ]}
      />

      {activeSettingsTab === "tenant" && (
        <SettingsTenantTab profileLoading={false} tenants={tenants} />
      )}
    </PageShell>
  );
}
