import { ErrorTrackingContent } from "@shared/errors/ErrorTrackingContent";

   
                                                                              
                                                                 
   
export function ErrorsTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ErrorTrackingContent lockedService={serviceName} />
    </div>
  );
}
