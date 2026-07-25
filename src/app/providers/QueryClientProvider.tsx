import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@shared/api/queryClient";
import type { ReactNode } from "react";

interface AppQueryClientProviderProps {
  readonly children: ReactNode;
}

export default function AppQueryClientProvider({
  children,
}: AppQueryClientProviderProps): JSX.Element {
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>;
}
