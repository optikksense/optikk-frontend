import axios from "axios";
import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";

import { resolveApiBaseURL } from "../http/baseUrl";

/**
 * Pure HTTP layer for the auth endpoints. Uses a bare axios instance (not the
 * shared client) so these requests never enter the Bearer/tenant interceptors
 * and a 401 here can never trigger a recursive refresh.
 */

const tenantSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  role: z.string().nullish(),
  accountStatus: z.string().nullish(),
  trialEndsAt: z.string().nullish(),
});

const userSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  name: z.string().nullish(),
});

const sessionPayloadSchema = z.object({
  user: userSchema,
  tenant: tenantSchema,
  accessToken: z.string().min(1),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const envelopeSchema = z.object({ success: z.literal(true), data: z.unknown() });

/**
 * Every auth failure is exactly one of two kinds. Only a `rejected` failure —
 * the server definitively said no (HTTP 401) — may tear a session down. An
 * `unavailable` failure (network, timeout, 5xx, malformed response) is transient
 * and must be retried, never treated as a logout.
 */
export type AuthErrorKind = "rejected" | "unavailable";

export class AuthError extends Error {
  readonly kind: AuthErrorKind;

  constructor(message: string, kind: AuthErrorKind) {
    super(message);
    this.name = "AuthError";
    this.kind = kind;
  }
}

const http = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

function serverMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }
  const body = error.response?.data;
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const message = (body as { error?: { message?: unknown } }).error?.message;
  return typeof message === "string" && message.length > 0 ? message : null;
}

/** Maps any thrown value to an AuthError; a 401 is the only `rejected` case. */
function toAuthError(error: unknown, fallback: string): AuthError {
  if (error instanceof AuthError) {
    return error;
  }
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const kind: AuthErrorKind = status === 401 ? "rejected" : "unavailable";
  return new AuthError(serverMessage(error) ?? fallback, kind);
}

/** Runs an auth request, normalizing every failure into an AuthError. */
async function request(url: string, body: unknown, fallback: string): Promise<unknown> {
  try {
    const response = await http.post(url, body);
    return response.data;
  } catch (error: unknown) {
    throw toAuthError(error, fallback);
  }
}

function unwrapSession(responseBody: unknown): SessionPayload {
  const envelope = envelopeSchema.safeParse(responseBody);
  const candidate = envelope.success ? envelope.data.data : responseBody;
  const payload = sessionPayloadSchema.safeParse(candidate);
  if (!payload.success) {
    // Treated as transient so a contract drift never logs an active user out.
    console.warn("[authApi] unexpected session payload", payload.error.issues);
    throw new AuthError("Unexpected response from auth server", "unavailable");
  }
  return payload.data;
}

// Signup's envelope carries the tenant's apiKey alongside the session.
const signupKeySchema = z.object({ apiKey: z.string().min(1) });

function extractApiKey(responseBody: unknown): string {
  const envelope = envelopeSchema.safeParse(responseBody);
  const candidate = envelope.success ? envelope.data.data : responseBody;
  const parsed = signupKeySchema.safeParse(candidate);
  return parsed.success ? parsed.data.apiKey : "";
}

export interface SignupParams {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly orgName: string;
  readonly acceptedTerms: boolean;
}

interface VerifyResult {
  readonly session: SessionPayload;
  readonly apiKey: string;
}

type SignupResult =
  | { readonly kind: "verificationRequired" }
  | { readonly kind: "signedIn"; readonly session: SessionPayload; readonly apiKey: string };

export const authApi = {
  async login(email: string, password: string): Promise<SessionPayload> {
    return unwrapSession(
      await request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password }, "Login failed")
    );
  },

  async signup(params: SignupParams): Promise<SignupResult> {
    const body = await request(
      API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
      {
        email: params.email,
        password: params.password,
        name: params.name,
        tenantName: params.orgName,
        acceptedTerms: params.acceptedTerms,
      },
      "Sign up failed"
    );
    const apiKey = extractApiKey(body);
    if (apiKey === "") {
      return { kind: "verificationRequired" };
    }
    return { kind: "signedIn", session: unwrapSession(body), apiKey };
  },

  async verifyEmail(token: string): Promise<VerifyResult> {
    const body = await request(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token },
      "Email verification failed"
    );
    return { session: unwrapSession(body), apiKey: extractApiKey(body) };
  },

  async refresh(): Promise<SessionPayload> {
    return unwrapSession(
      await request(API_CONFIG.ENDPOINTS.AUTH.REFRESH, undefined, "Session expired")
    );
  },

  async logout(accessToken: string | null): Promise<void> {
    await http.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, undefined, {
      headers: accessToken != null ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await request(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email },
      "Failed to request password reset"
    );
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await request(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password },
      "Failed to reset password"
    );
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await request(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword },
      "Failed to change password"
    );
  },
};
