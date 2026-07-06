import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));

export const Route = createFileRoute("/_app/settings")({
  component: () => <SettingsPage />,
});
