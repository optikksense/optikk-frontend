import { type ReactNode, memo } from "react";

export interface FacetRailContainerProps {
  readonly children: ReactNode;
}

   
                                                             
                                                                                       
   
function FacetRailContainerComponent({ children }: FacetRailContainerProps) {
  return (
    <div className="border-border border-r bg-background" style={{ padding: "16px 14px" }}>
      {                                                                      }
      <div className="sticky top-4 max-h-[calc(100vh-var(--space-header-h,56px)-3rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export const FacetRailContainer = memo(FacetRailContainerComponent);
