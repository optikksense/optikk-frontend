   
                                                                          
                                                                    
                                                                     
                                       
   

let pendingApiKey: string | null = null;

export function stashSignupApiKey(key: string): void {
  pendingApiKey = key.length > 0 ? key : null;
}

export function takeSignupApiKey(): string | null {
  const key = pendingApiKey;
  pendingApiKey = null;
  return key;
}
