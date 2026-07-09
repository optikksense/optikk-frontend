import WelcomePage from "@/app/auth/pages/WelcomePage";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/welcome")({
  component: () => <WelcomePage />,
});
