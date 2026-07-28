import { z } from "zod";

   
                                                                             
                                                                     
                                               
   
export const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  limit: z.number(),
});
