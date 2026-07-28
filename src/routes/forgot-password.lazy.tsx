import { createLazyFileRoute } from "@tanstack/react-router";

import { ForgotPasswordPage } from "@/app/auth/pages/ForgotPasswordPage/ForgotPasswordPage";

export const Route = createLazyFileRoute("/forgot-password")({
  component: () => <ForgotPasswordPage />,
});
