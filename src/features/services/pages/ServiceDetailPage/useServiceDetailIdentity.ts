import { useLocation } from "@tanstack/react-router";

export interface ServiceIdentity {
  readonly serviceName: string;
  readonly isValid: boolean;
}

   
                                                                             
                                                                             
                                         
   
export function useServiceDetailIdentity(): ServiceIdentity {
  const location = useLocation();
  const match = location.pathname.match(/^\/services\/([^/?#]+)/);
  const raw = match ? decodeURIComponent(match[1]) : "";
  return { serviceName: raw, isValid: Boolean(raw) };
}
