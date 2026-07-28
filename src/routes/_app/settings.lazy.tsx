import { createLazyFileRoute } from "@tanstack/react-router";

import SettingsPage from "@/features/settings/pages/SettingsPage/SettingsPage";

export const Route = createLazyFileRoute("/_app/settings")({
  component: () => <SettingsPage />,
});
