import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";
import { useState } from "react";

import { PageHeader, PageShell } from "@shared/components/ui";

import ChannelsTab from "./ChannelsTab";
import IntegrationsTab from "./IntegrationsTab";
import PoliciesTab from "./PoliciesTab";
import TemplatesTab from "./TemplatesTab";

type Tab = "channels" | "integrations" | "policies" | "templates";

const TABS: { id: Tab; label: string }[] = [
  { id: "channels", label: "Channels" },
  { id: "integrations", label: "Integrations" },
  { id: "policies", label: "Routing policies" },
  { id: "templates", label: "Templates" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("channels");

  return (
    <PageShell>
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => navigate({ to: "/monitors" })}
          className="flex items-center gap-1 text-foreground-muted hover:text-foreground"
        >
          <ArrowLeft size={12} />
          Monitors
        </button>
        <span className="text-foreground-muted">/</span>
        <span className="font-medium text-foreground">Notifications</span>
      </div>

      <PageHeader
        title="Notifications"
        subtitle="Manage channels, integrations, message templates, and routing policies"
        icon={<Bell size={22} />}
      />

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "channels" && <ChannelsTab />}
      {tab === "integrations" && <IntegrationsTab />}
      {tab === "policies" && <PoliciesTab />}
      {tab === "templates" && <TemplatesTab />}
    </PageShell>
  );
}
