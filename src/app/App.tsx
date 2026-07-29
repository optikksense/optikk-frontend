import ErrorBoundary from "@shared/components/ui/feedback/ErrorBoundary";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "../routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="app-shell">
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
