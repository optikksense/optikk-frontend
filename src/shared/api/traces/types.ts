   
                                                                            
                                                                   
                                                              
   
import type { ExplorerFilter, ExplorerIncludeFlag } from "@shared/search/types";

export interface TraceSummary {
  readonly traceId: string;
  readonly tenantId: number;
  readonly startMs: number;
  readonly endMs: number;
  readonly durationNs: number;
  readonly rootService: string;
  readonly rootOperation: string;
  readonly rootStatus: string;
  readonly rootHttpMethod?: string;
  readonly rootHttpStatus?: string;
  readonly rootEndpoint?: string;
  readonly spanCount: number;
  readonly hasError: boolean;
  readonly errorCount: number;
  readonly environment?: string;
  readonly serviceSet?: readonly string[];
  readonly truncated?: boolean;
}

export interface TracesQueryRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly cursor?: string;
  readonly limit: number;
  readonly include?: readonly ExplorerIncludeFlag[];
}

export interface TracesFacetBucket {
  readonly value: string;
  readonly count: number;
}

                                                     
export type TracesFacets = Readonly<Record<string, readonly TracesFacetBucket[]>>;

   
                                                                            
                                                                             
                                                                         
   
export interface TracesQueryResponse {
  readonly traces: readonly TraceSummary[];
  readonly nextCursor?: string;
}
