import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import { type Channel, listChannels } from "../api/notificationsApi";

export function useChannels() {
  return useStandardQuery<Channel[]>({
    queryKey: ["notifications", "channels"],
    queryFn: () => listChannels(),
  });
}
