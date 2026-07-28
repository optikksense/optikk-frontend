import type { RequestTime } from "@/shared/api/service-types";

export type REDFiltersParams = {
  readonly startTime: RequestTime;
  readonly endTime: RequestTime;
  readonly services?: readonly string[];
  readonly serviceName?: string;
  readonly [key: string]: RequestTime | string | readonly string[] | number | boolean | undefined;
};

   
                                                                           
                  
  
                                                                           
                                
   
export function buildREDFilters(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  extra?: Partial<REDFiltersParams>
): REDFiltersParams {
  const p: {
    startTime: RequestTime;
    endTime: RequestTime;
    services?: readonly string[];
    serviceName?: string;
    [key: string]: RequestTime | string | readonly string[] | number | boolean | undefined;
  } = { ...extra, startTime: s, endTime: e };

  if (services) {
    if (typeof services === "string") {
      p.serviceName = services;
    } else {
      if (services.length === 1) {
        p.serviceName = services[0];
      } else if (services.length > 1) {
        p.services = services;
      }
    }
  }

  return p;
}
