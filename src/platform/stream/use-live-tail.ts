import { useEffect } from "react"

import { API_CONFIG } from "@/platform/config/api"
import { useLiveTailStore } from "@/platform/stream/live-tail-store"

function liveTailWebSocketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws"
  return `${protocol}://${window.location.host}${API_CONFIG.baseUrl}${API_CONFIG.endpoints.liveTail}`
}

export function useLiveTail(scope: string, enabled: boolean) {
  const items = useLiveTailStore((state) => state.items)
  const status = useLiveTailStore((state) => state.status)
  const pushItem = useLiveTailStore((state) => state.pushItem)
  const setStatus = useLiveTailStore((state) => state.setStatus)
  const reset = useLiveTailStore((state) => state.reset)

  useEffect(() => {
    if (!enabled) {
      reset()
      return
    }

    const socket = new WebSocket(liveTailWebSocketUrl())
    setStatus("connecting")

    socket.onopen = () => {
      setStatus("live")
      socket.send(JSON.stringify({ op: `subscribe:${scope}`, payload: {} }))
    }

    socket.onmessage = (event) => {
      pushItem(
        {
          id: crypto.randomUUID(),
          message: event.data,
          timestamp: Date.now(),
        },
        200,
      )
    }

    socket.onerror = () => setStatus("error")
    socket.onclose = () => setStatus("closed")
    return () => socket.close()
  }, [enabled, pushItem, reset, scope, setStatus])

  return { items, status }
}
