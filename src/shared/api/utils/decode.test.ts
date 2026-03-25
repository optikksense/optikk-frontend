import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  decodeApiResponse,
  isHtmlLikePayload,
  normalizeApiPayload,
  unwrapApiPayload,
} from './decode';

describe('shared API decode utilities', () => {
  it('normalizes stringified JSON objects', () => {
    expect(normalizeApiPayload('{"service":"checkout"}')).toEqual({ service: 'checkout' });
  });

  it('unwraps stringified success envelopes', () => {
    expect(
      unwrapApiPayload(
        JSON.stringify({
          success: true,
          data: {
            results: [],
          },
        }),
      ),
    ).toEqual({ results: [] });
  });

  it('detects html-like payloads', () => {
    expect(isHtmlLikePayload('<!DOCTYPE html><html><body>login</body></html>')).toBe(true);
  });

  it('turns malformed plain-text payloads into normalized contract errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      decodeApiResponse(z.object({ results: z.array(z.unknown()) }), 'upstream exploded', {
        context: 'traces explorer',
        expectedType: 'object',
        message: 'Invalid traces explorer response',
      });
      throw new Error('expected decodeApiResponse to throw');
    } catch (error) {
      expect(error).toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'Invalid traces explorer response',
      });
    }

    consoleErrorSpy.mockRestore();
  });
});
