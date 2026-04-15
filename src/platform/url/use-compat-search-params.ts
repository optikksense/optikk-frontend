import { useLocation, useNavigate } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

export function useCompatSearchParams() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.searchStr), [location.searchStr])

  const replaceSearch = useCallback(
    (mutate: (draft: URLSearchParams) => void) => {
      const draft = new URLSearchParams(location.searchStr)
      mutate(draft)
      const nextSearch = draft.toString()
      navigate({
        to: location.pathname,
        search: nextSearch ? Object.fromEntries(draft.entries()) : {},
        replace: true,
      })
    },
    [location.pathname, location.searchStr, navigate],
  )

  return { searchParams, replaceSearch }
}
