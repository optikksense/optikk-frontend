   
                                                                        
                                                                           
                                                            
   
export function resolveOtlpEndpoint(): string {
  const fromEnv = import.meta.env.VITE_OTLP_ENDPOINT;
  if (fromEnv != null && fromEnv.length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }
  const { origin } = window.location;
  if (origin.includes("app.")) {
    return origin.replace("app.", "ingest.");
  }
  if (origin.includes("api.")) {
    return origin.replace("api.", "ingest.");
  }
  return "http://localhost:4318";
}
