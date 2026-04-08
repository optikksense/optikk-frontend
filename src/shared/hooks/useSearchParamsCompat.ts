import { RouteComponent, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

/**
 * A compatibility shim to support the legacy react-router-dom
 * [URLSearchParams, setSearchParams] tuple interface during migration to TanStack Router.
 *
 * Note: Since TanStack uses strict typed search params, we drop to { strict: false }
 * temporarily while we incrementally adopt full route-level search schemas.
 */
export function useSearchParamsCompat(): [
  URLSearchParams,
  (
    newParams: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void,
] {
  const searchObj = useSearch({ strict: false });
  const navigate = useNavigate();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchObj && typeof searchObj === "object") {
      for (const [key, val] of Object.entries(searchObj)) {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((v) => params.append(key, String(v)));
          } else {
            params.set(key, String(val));
          }
        }
      }
    }
    return params;
  }, [searchObj]);

  const setSearchParams = useCallback(
    (
      newParams: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean }
    ) => {
      let finalParams: URLSearchParams;
      if (typeof newParams === "function") {
        finalParams = newParams(searchParams);
      } else {
        finalParams = newParams;
      }

      const nextSearchObj: Record<string, string | string[]> = {};
      for (const [key, val] of finalParams.entries()) {
        if (nextSearchObj[key] !== undefined) {
          if (Array.isArray(nextSearchObj[key])) {
            (nextSearchObj[key] as string[]).push(val);
          } else {
            nextSearchObj[key] = [nextSearchObj[key] as string, val];
          }
        } else {
          nextSearchObj[key] = val;
        }
      }

      // We navigate to the current path but merge in the new search object
      navigate({
        search: nextSearchObj as any,
        replace: options?.replace,
      });
    },
    [navigate, searchParams]
  );

  return [searchParams, setSearchParams];
}
