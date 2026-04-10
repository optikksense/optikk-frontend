import type { DashboardTabDocument, DefaultConfigPage, DefaultConfigTab } from "@/types/dashboardConfig";

import { API_CONFIG } from "@config/apiConfig";

import api from "./api";
import {
  dashboardTabDocumentSchema,
  listPagesSchema,
  listTabsSchema,
} from "./schemas/defaultConfigSchemas";
import { decodeApiResponse } from "./utils/validate";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const defaultConfigService = {
  async listPages(_teamId: number | null): Promise<DefaultConfigPage[]> {
    const response = await api.get(`${BASE}/default-config/pages`);
    return decodeApiResponse(listPagesSchema, response, {
      context: "default config pages",
      expectedType: "object",
    }).pages;
  },

  async listPageTabs(_teamId: number | null, pageId: string): Promise<DefaultConfigTab[]> {
    const response = await api.get(`${BASE}/default-config/pages/${pageId}/tabs`);
    return decodeApiResponse(listTabsSchema, response, {
      context: `default config tabs for ${pageId}`,
      expectedType: "object",
    }).tabs;
  },

  async getDashboardTabDocument(
    _teamId: number | null,
    pageId: string,
    tabId: string
  ): Promise<DashboardTabDocument | null> {
    const response = await api.get(`${BASE}/default-config/pages/${pageId}/tabs/${tabId}`);
    return decodeApiResponse(dashboardTabDocumentSchema, response, {
      context: `default config tab document for ${pageId}/${tabId}`,
      expectedType: "object",
    });
  },
};
