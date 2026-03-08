import { describe, expect, it } from 'vitest';

import { API_CONFIG, API_ENDPOINTS, API_V1_BASE } from './apiConfig';

describe('apiConfig', () => {
  it('uses /v1-prefixed auth/settings/team endpoints', () => {
    expect(API_V1_BASE).toBe('/v1');
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/v1/auth/login');
    expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/v1/auth/logout');
    expect(API_ENDPOINTS.AUTH.ME).toBe('/v1/auth/me');
    expect(API_ENDPOINTS.TEAMS.LIST).toBe('/v1/teams');
    expect(API_ENDPOINTS.SETTINGS.PROFILE).toBe('/v1/settings/profile');
  });

  it('exposes BASE_URL correctly', () => {
    expect(API_CONFIG.BASE_URL).toBe('/api');
  });
});
