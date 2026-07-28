import { createLazyFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/app/auth/pages/LoginPage/LoginPage";

export const Route = createLazyFileRoute("/login")({
  component: () => <LoginPage />,
});
