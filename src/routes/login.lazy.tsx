import { createLazyFileRoute } from "@tanstack/react-router";

import LoginPage from "@/app/auth";

export const Route = createLazyFileRoute("/login")({
  component: () => <LoginPage />,
});
