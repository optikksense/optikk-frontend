import { createLazyFileRoute } from "@tanstack/react-router";

import ResetPasswordPage from "@/app/auth/pages/ResetPasswordPage";

export const Route = createLazyFileRoute("/reset-password")({
  component: () => <ResetPasswordPage />,
});
