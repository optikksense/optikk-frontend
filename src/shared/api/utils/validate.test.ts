import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { validateResponse } from "./validate";

const spanSchema = z.object({ span_id: z.string(), duration_ms: z.number() });
const envelopeSchema = z.object({ spans: z.array(spanSchema) });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("validateResponse", () => {
  it("strips unknown keys nested inside an enveloped array instead of throwing", () => {
    // The shape that produced "Failed to load trace details": the backend added
    // has_error/start_ns to each span while the schema still described neither.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wire = {
      spans: [
        { span_id: "a", duration_ms: 1, has_error: false, start_ns: 17 },
        { span_id: "b", duration_ms: 2, has_error: true, start_ns: 18 },
      ],
    };

    const result = validateResponse(envelopeSchema, wire);

    expect(result.spans).toEqual([
      { span_id: "a", duration_ms: 1 },
      { span_id: "b", duration_ms: 2 },
    ]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][1]).toEqual({
      unknownKeys: ["spans[].has_error", "spans[].start_ns"],
    });
  });

  it("still rejects a missing required field", () => {
    expect(() => validateResponse(envelopeSchema, { spans: [{ span_id: "a" }] })).toThrow();
  });

  it("reports nothing when the wire matches the schema", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    validateResponse(envelopeSchema, { spans: [{ span_id: "a", duration_ms: 1 }] });
    expect(warn).not.toHaveBeenCalled();
  });
});
