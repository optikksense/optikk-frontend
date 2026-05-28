import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { useAppStore } from "@store/appStore";
import { useAuthIsLoading, useAuthStore } from "@store/authStore";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export function useLoginSubmit() {
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
    if (!result.success) return;
    setTimeRange({ kind: "relative", preset: "30m", label: "Last 30 minutes", minutes: 30 });
    toast.success("Login successful!");
    navigate({ to: "/overview" });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    handleSubmit,
  };
}
