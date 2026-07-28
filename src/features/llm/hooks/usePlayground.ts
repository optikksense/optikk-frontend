import { useMutation } from "@tanstack/react-query";

import { type PlaygroundCompleteRequest, playgroundComplete } from "../api/playgroundApi";

export function usePlaygroundComplete() {
  return useMutation({
    mutationFn: (req: PlaygroundCompleteRequest) => playgroundComplete(req),
  });
}
