import { createLazyFileRoute } from "@tanstack/react-router";

import { SignupPage } from "@/app/auth/pages/SignupPage/SignupPage";

export const Route = createLazyFileRoute("/signup")({
  component: () => <SignupPage />,
});
