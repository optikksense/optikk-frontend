import { createLazyFileRoute } from "@tanstack/react-router";
import { DatabaseZap } from "lucide-react";

import { IngestionPage } from "@/features/ingestion";
import SettingsPage from "@/features/settings/pages/SettingsPage";

                                                                             
                                                                        
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
