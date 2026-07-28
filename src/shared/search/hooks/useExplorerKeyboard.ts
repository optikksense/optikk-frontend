import { useEffect } from "react";

export interface ExplorerKeyHandlers {
  readonly onSearchFocus?: () => void;
  readonly onNavNext?: () => void;
  readonly onNavPrev?: () => void;
  readonly onExpand?: () => void;
  readonly onFacetOpen?: () => void;
  readonly onClose?: () => void;
}

function shouldSkip(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

   
                           
                                                        
                                               
  
                                                                     
                                  
   
export function useExplorerKeyboard(handlers: ExplorerKeyHandlers): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        handlers.onClose?.();
        return;
      }
      if (shouldSkip(event.target)) return;
      switch (event.key) {
        case "/":
          event.preventDefault();
          handlers.onSearchFocus?.();
          break;
        case "j":
          handlers.onNavNext?.();
          break;
        case "k":
          handlers.onNavPrev?.();
          break;
        case "e":
          handlers.onExpand?.();
          break;
        case "f":
          handlers.onFacetOpen?.();
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
