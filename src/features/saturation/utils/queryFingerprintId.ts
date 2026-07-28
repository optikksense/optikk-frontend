import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";

   
                                                                      
                                                                         
                                                                             
                                                                           
                                                          
   
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

export function queryFingerprintId(
  row: Pick<SlowQueryPatternRow, "queryText" | "collectionName">
): string {
  return djb2(`${row.queryText}::${row.collectionName}`).toString(36);
}
