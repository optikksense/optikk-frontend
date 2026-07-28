   
                         
  
                                                                                
                                                                            
                                                                           
                                                                    
   
import type { RequestTime } from "@/shared/api/service-types";

import { getHosts } from "@shared/api/hosts";

import { getDatastoreSummary, getDatastoreSystems } from "./datastoresExplorerApi";
import { getKafkaSummary } from "./kafkaExplorerApi";

export type {
  DatastoreSummary,
  DatastoreSystemRow,
} from "./datastoresExplorerSchemas";
export type { Host as HostSaturationRow } from "@shared/api/hosts";
export type { KafkaSummary } from "./kafkaExplorerSchemas";

type R = RequestTime;
type T = number | null;

export const saturationApi = {
  getHostSaturation: (_t: T, s: R, e: R) => getHosts(s, e),

  getDatastoreSummary: (_t: T, s: R, e: R) => getDatastoreSummary(s, e),
  getDatastoreSystems: (_t: T, s: R, e: R) => getDatastoreSystems(s, e),

  getKafkaSummary: (_t: T, s: R, e: R) => getKafkaSummary(s, e),
};
