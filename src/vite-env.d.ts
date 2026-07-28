                                     

interface ImportMetaEnv {
  readonly VITE_OTEL_ENABLED?: string;
                                                                                                                           
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?: string;
  readonly VITE_OTEL_SERVICE_NAME?: string;

  readonly VITE_OTEL_TRACES_SAMPLE_RATIO?: string;

                                                                        
  readonly VITE_OTLP_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
