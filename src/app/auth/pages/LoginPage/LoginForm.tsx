import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { useAppStore } from "@store/appStore";
import { useAuthIsLoading, useAuthStore } from "@store/authStore";

import { LoginField } from "./LoginField";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

/**
 * Login form — email, password, remember-me, submit.
 */
export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthIsLoading();
  const setTimeRange = useAppStore((s) => s.setTimeRange);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    const result = await login(parsed.data.email, parsed.data.password);
    if (result.success) {
      applyPostLoginDefaults();
      navigate({ to: "/overview" });
    }
  };

  const applyPostLoginDefaults = (): void => {
    setTimeRange({
      kind: "relative",
      preset: "30m",
      label: "Last 30 minutes",
      minutes: 30,
    });
    toast.success("Login successful!");
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
      <LoginField
        id="email"
        label="Work Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
        icon={<Mail size={16} />}
        required
        autoComplete="email"
      />

      <LoginField
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••••"
        icon={<Lock size={16} />}
        required
        autoComplete="current-password"
        endSlot={<PasswordToggle show={showPassword} onToggle={setShowPassword} />}
      />

      <SubmitButton loading={isLoading} />
    </form>
  );
}

/* ── Sub-components (kept private to this file) ─────────── */

function PasswordToggle({
  show,
  onToggle,
}: {
  readonly show: boolean;
  readonly onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="login-input-end"
      onClick={() => onToggle(!show)}
      aria-label={show ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}




function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="login-submit"
      type="submit"
      className="login-submit"
      disabled={loading}
    >
      {loading ? (
        <span className="login-spinner" />
      ) : (
        <>
          <LogIn size={18} />
          Sign in to Optikk
        </>
      )}
    </button>
  );
}
