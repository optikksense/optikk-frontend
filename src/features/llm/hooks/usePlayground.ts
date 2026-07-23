import { useMutation } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type PlaygroundCompleteRequest,
  getPricing,
  playgroundComplete,
} from "../api/playgroundApi";

export function usePricing() {
  return useStandardQuery({
    queryKey: ["llm", "pricing"],
    queryFn: getPricing,
    staleTime: 60 * 60 * 1000,
  });
}

export function usePlaygroundComplete() {
  return useMutation({
    mutationFn: (req: PlaygroundCompleteRequest) => playgroundComplete(req),
  });
}
