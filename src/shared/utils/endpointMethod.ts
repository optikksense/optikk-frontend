import type { TopEndpoint } from "@shared/api/red/redApi";

   
                                     
  
                                                                           
                                                                            
                                                                           
                                                                            
                                                           
   
export function endpointMethod(row: Pick<TopEndpoint, "httpMethod" | "rpcSystem">): string | null {
  if (row.httpMethod) return row.httpMethod.toUpperCase();
  if (row.rpcSystem) return row.rpcSystem === "grpc" ? "gRPC" : row.rpcSystem.toUpperCase();
  return null;
}
