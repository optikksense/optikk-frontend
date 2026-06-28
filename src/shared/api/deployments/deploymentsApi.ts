import { z } from "zod";

import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { validateResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

import {
  activeVersionSchema,
  type compareEndpointRegressionSchema,
  type compareErrorRegressionSchema,
  type compareWindowSchema,
  deploymentCompareSchema,
  deploymentImpactResponseSchema,
  type deploymentImpactRowSchema,
  deploymentListResponseSchema,
  type deploymentRowSchema,
  type impactMetricsSchema,
  latestDeploymentSchema,
  versionTrafficPointSchema,
} from "./deploymentSchemas";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export type ServiceLatestDeployment = z.infer<typeof latestDeploymentSchema>;
export type DeploymentVersionTrafficPoint = z.infer<typeof versionTrafficPointSchema>;
export type DeploymentCompareResponse = z.infer<typeof deploymentCompareSchema>;
export type DeploymentListResponse = z.infer<typeof deploymentListResponseSchema>;
export type DeploymentImpactResponse = z.infer<typeof deploymentImpactResponseSchema>;
export type ActiveVersion = z.infer<typeof activeVersionSchema>;

export const deploymentsApi = {
  async getLatestByService(): Promise<ServiceLatestDeployment[]> {
    const data = await api.get(`${BASE}/deployments/latest-by-service`);
    return validateResponse(z.array(latestDeploymentSchema), data);
  },

  async getVersionTraffic(
    serviceName: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DeploymentVersionTrafficPoint[]> {
    const data = await api.get(`${BASE}/deployments/timeline`, {
      params: { serviceName, startTime, endTime },
    });
    return validateResponse(z.array(versionTrafficPointSchema), data);
  },

  async getDeploymentCompare(params: {
    serviceName: string;
    version: string;
    environment: string;
    deployedAt: number;
  }): Promise<DeploymentCompareResponse> {
    const data = await api.get(`${BASE}/deployments/compare`, { params });
    return validateResponse(deploymentCompareSchema, data);
  },

  async getList(
    serviceName: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DeploymentListResponse> {
    const data = await api.get(`${BASE}/deployments/list`, {
      params: { serviceName, startTime, endTime },
    });
    return validateResponse(deploymentListResponseSchema, data);
  },

  async getImpact(
    serviceName: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DeploymentImpactResponse> {
    const data = await api.get(`${BASE}/deployments/impact`, {
      params: { serviceName, startTime, endTime },
    });
    return validateResponse(deploymentImpactResponseSchema, data);
  },

  async getActiveVersion(
    serviceName: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ActiveVersion> {
    const data = await api.get(`${BASE}/deployments/active-version`, {
      params: { serviceName, startTime, endTime },
    });
    return validateResponse(activeVersionSchema, data);
  },
};
