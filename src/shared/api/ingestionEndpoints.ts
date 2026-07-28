import api from "@/shared/api/http/client";
import { API_CONFIG } from "@config/apiConfig";

/**
 * Canonical OTLP connection info, owned by the backend
 * (`GET /api/v1/tenants/current/ingestion-endpoints`) so the UI never
 * derives ingest endpoints from its own origin.
 */
export interface IngestionEndpoints {
  /** Host:port for OTLP over gRPC, e.g. "ingest.optikk.in:4317". */
  readonly grpc: string;
  /** Base URL for OTLP over HTTP, e.g. "https://ingest.optikk.in:4318". */
  readonly http: string;
  /** Header carrying the tenant API key, e.g. "x-api-key". */
  readonly headerName: string;
}

/** Local-dev ingest ports (`ingest/config.yml`), used if the fetch fails. */
export const LOCAL_INGESTION_ENDPOINTS: IngestionEndpoints = {
  grpc: "localhost:18317",
  http: "http://localhost:18318",
  headerName: "x-api-key",
};

export function getIngestionEndpoints(): Promise<IngestionEndpoints> {
  return api.get<IngestionEndpoints>(
    `${API_CONFIG.ENDPOINTS.V1_BASE}/tenants/current/ingestion-endpoints`
  );
}
