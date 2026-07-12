import { createLazyFileRoute } from "@tanstack/react-router";
import { DatabaseZap } from "lucide-react";

import { IngestionPage } from "@/features/ingestion";
import SettingsPage from "@/features/settings/pages/SettingsPage";

// Ingestion lives as a Settings tab; injected here at the route layer so the
// settings feature never imports the ingestion feature (boundary rule).
const extraTabs = [
  {
    key: "ingestion",
    label: "Ingestion",
    icon: <DatabaseZap size={14} />,
    render: () => <IngestionPage />,
  },
];

export const Route = createLazyFileRoute("/_app/settings")({
  component: () => <SettingsPage extraTabs={extraTabs} />,
});
