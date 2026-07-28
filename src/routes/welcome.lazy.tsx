import { WelcomePage } from "@/features/onboarding/pages/WelcomePage/WelcomePage";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/welcome")({
  component: () => <WelcomePage />,
});
