import { ROUTES } from "@shared/constants/routes";

import { AuthPageShell } from "../../components/AuthPageShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      prompt="Remembered your password?"
      actionLabel="Sign in"
      actionTo={ROUTES.login}
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
