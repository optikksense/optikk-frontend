import { useLocation } from "@tanstack/react-router";

export interface ServiceIdentity {
  readonly serviceName: string;
  readonly isValid: boolean;
}

/**
 * Pulls the `$serviceName` segment from the current `/services/:serviceName`
 * URL. Returns an `isValid` flag so the page can short-circuit to a friendly
 * empty state when the URL is malformed.
 */
export function useServiceDetailIdentity(): ServiceIdentity {
  const location = useLocation();
  const match = location.pathname.match(/^\/services\/([^/?#]+)/);
  const raw = match ? decodeURIComponent(match[1]) : "";
  return { serviceName: raw, isValid: Boolean(raw) };
}
