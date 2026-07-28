import { type ReactNode, memo } from "react";

export interface ExplorerLayoutProps {
  readonly header: ReactNode;
  readonly facets: ReactNode;
  readonly content: ReactNode;
}

   
                                                             
                                                                                                
   
function ExplorerLayoutComponent({ header, facets, content }: ExplorerLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="bg-surface-muted">{header}</div>

      <div className="grid flex-1 grid-cols-[236px_1fr]">
        {facets}

        <div className="flex min-w-0 flex-col bg-background p-4 md:p-[18px_22px]">{content}</div>
      </div>
    </div>
  );
}

export const ExplorerLayout = memo(ExplorerLayoutComponent);
