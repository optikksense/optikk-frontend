import { z } from 'zod';

import type {
  DashboardDrawerAction,
  DashboardLayout,
  DashboardPanelSpec,
  DashboardQuerySpec,
  DashboardStatSummaryField,
  DashboardTableColumn,
  DashboardSectionSpec,
  DashboardTabDocument,
  DashboardSchemaVersion,
  DefaultConfigPage,
  DefaultConfigTab,
} from '@/types/dashboardConfig';
import {
  DASHBOARD_LAYOUT_VARIANTS,
  DASHBOARD_PANEL_TYPES,
  DASHBOARD_SECTION_TEMPLATES,
} from '@/types/dashboardConfig';

import { API_CONFIG } from '@config/apiConfig';

import api from './api';
import { decodeApiResponse } from './utils/validate';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const dashboardSchemaVersionSchema = z.union([
  z.literal(1),
  z.literal(2),
]) satisfies z.ZodType<DashboardSchemaVersion>;

const pageSchema: z.ZodType<DefaultConfigPage> = z.object({
  schemaVersion: dashboardSchemaVersionSchema,
  id: z.string(),
  path: z.string(),
  label: z.string(),
  icon: z.string(),
  group: z.string(),
  order: z.number(),
  defaultTabId: z.string().optional(),
  navigable: z.boolean(),
  renderMode: z.enum(['dashboard', 'explorer']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

const listPagesSchema = z.object({
  pages: z.array(pageSchema),
});

const tabSummarySchema: z.ZodType<DefaultConfigTab> = z.object({
  id: z.string(),
  pageId: z.string(),
  label: z.string(),
  order: z.number(),
});

const listTabsSchema = z.object({
  pageId: z.string(),
  tabs: z.array(tabSummarySchema),
});

const sectionSchema: z.ZodType<DashboardSectionSpec> = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  collapsible: z.boolean(),
  sectionTemplate: z.enum(DASHBOARD_SECTION_TEMPLATES),
});

const queryParamValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean()),
]);

const panelQuerySchema: z.ZodType<DashboardQuerySpec> = z
  .object({
    method: z.string(),
    endpoint: z.string(),
    params: z.record(z.string(), queryParamValueSchema).optional(),
  })
  .strict();

const panelLayoutSchema: z.ZodType<DashboardLayout> = z
  .object({
    x: z.number(),
    y: z.number(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
  })
  .strict();

const statSummaryFieldSchema: z.ZodType<DashboardStatSummaryField> = z
  .object({
    label: z.string(),
    field: z.string().optional(),
    keys: z.array(z.string()).optional(),
  })
  .strict();

const dashboardTableColumnSchema: z.ZodType<DashboardTableColumn> = z
  .object({
    key: z.string(),
    label: z.string(),
    formatter: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    width: z.number().int().positive().optional(),
  })
  .strict();

const dashboardDrawerActionSchema: z.ZodType<DashboardDrawerAction> = z
  .object({
    entity: z.enum([
      'aiModel',
      'databaseSystem',
      'errorGroup',
      'kafkaGroup',
      'kafkaTopic',
      'node',
      'redisInstance',
    ]),
    idField: z.string(),
    titleField: z.string().optional(),
  })
  .strict();

const panelSchema: z.ZodType<DashboardPanelSpec> = z
  .object({
    id: z.string(),
    panelType: z.enum(DASHBOARD_PANEL_TYPES),
    layoutVariant: z.enum(DASHBOARD_LAYOUT_VARIANTS),
    sectionId: z.string(),
    order: z.number(),
    query: panelQuerySchema,
    layout: panelLayoutSchema,
    title: z.string().optional(),
    description: z.string().optional(),
    titleIcon: z.string().optional(),
    icon: z.string().optional(),
    dataSource: z.string().optional(),
    dataKey: z.string().optional(),
    groupByKey: z.string().optional(),
    labelKey: z.string().optional(),
    xKey: z.string().optional(),
    yKey: z.string().optional(),
    endpointDataSource: z.string().optional(),
    endpointMetricsSource: z.string().optional(),
    endpointListType: z.string().optional(),
    valueField: z.string().optional(),
    valueKey: z.string().optional(),
    valueKeys: z.array(z.string()).optional(),
    bucketKey: z.string().optional(),
    datasetLabel: z.string().optional(),
    color: z.string().optional(),
    formatter: z.string().optional(),
    stacked: z.boolean().optional(),
    listSortField: z.string().optional(),
    listType: z.string().optional(),
    listTitle: z.string().optional(),
    columns: z.array(dashboardTableColumnSchema).optional(),
    drawerAction: dashboardDrawerActionSchema.optional(),
    targetThreshold: z.number().optional(),
    summaryFields: z.array(statSummaryFieldSchema).optional(),
    yPrefix: z.string().optional(),
    yDecimals: z.number().int().optional(),
  })
  .strict();

const dashboardTabDocumentSchema: z.ZodType<DashboardTabDocument> = z.object({
  id: z.string(),
  pageId: z.string(),
  label: z.string(),
  order: z.number(),
  sections: z.array(sectionSchema),
  panels: z.array(panelSchema),
});

export /**
 *
 */
const defaultConfigService = {
  async listPages(_teamId: number | null): Promise<DefaultConfigPage[]> {
    const response = await api.get(`${BASE}/default-config/pages`);
    return decodeApiResponse(listPagesSchema, response, {
      context: 'default config pages',
      expectedType: 'object',
    }).pages;
  },

  async listPageTabs(_teamId: number | null, pageId: string): Promise<DefaultConfigTab[]> {
    const response = await api.get(`${BASE}/default-config/pages/${pageId}/tabs`);
    return decodeApiResponse(listTabsSchema, response, {
      context: `default config tabs for ${pageId}`,
      expectedType: 'object',
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
      expectedType: 'object',
    });
  },
};
