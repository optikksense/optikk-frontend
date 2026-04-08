import { useTeamId } from "@/app/store/appStore";
import { useSocketStream } from "@shared/hooks/useSocketStream";

interface UseLiveTailStreamOptions<Item> {
  enabled: boolean;
  /** Socket.io subscribe event (e.g. 'subscribe:spans', 'subscribe:logs') */
  subscribeEvent?: string;
  /** Socket.io item event (e.g. 'span', 'log') */
  itemEvent?: string;
  /** Params sent with the subscribe event */
  params?: Record<string, unknown>;
  maxItems?: number;
  normalizeItem?: (value: unknown) => Item;
  getItemKey?: (item: Item) => string;
  getItemTimestamp?: (item: Item) => number;
}

interface UseLiveTailStreamResult<Item> {
  items: Item[];
  status: "idle" | "connecting" | "live" | "closed" | "error";
  lagMs: number;
  droppedCount: number;
  errorMessage: string | null;
}

export function useLiveTailStream<Item>({
  enabled,
  subscribeEvent = "subscribe:spans",
  itemEvent = "span",
  params,
  maxItems = 20,
  normalizeItem,
  getItemKey,
  getItemTimestamp,
}: UseLiveTailStreamOptions<Item>): UseLiveTailStreamResult<Item> {
  const teamId = useTeamId();

  return useSocketStream<Item>({
    enabled,
    subscribeEvent,
    itemEvent,
    params: { teamId, ...params },
    maxItems,
    normalizeItem,
    getItemKey,
    getItemTimestamp,
  });
}
