import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { validateResponse } from "./validate";

const spanSchema = z.object({ spanId: z.string(), durationMs: z.number() });
const envelopeSchema = z.object({ spans: z.array(spanSchema) });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("validateResponse", () => {
  it("strips unknown keys nested inside an enveloped array instead of throwing", () => {
    // The shape that produced "Failed to load trace details": the backend added
    // hasError/startNs to each span while the schema still described neither.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wire = {
      spans: [
        { spanId: "a", durationMs: 1, hasError: false, startNs: 17 },
        { spanId: "b", durationMs: 2, hasError: true, startNs: 18 },
      ],
    };

    const result = validateResponse(envelopeSchema, wire);

    expect(result.spans).toEqual([
      { spanId: "a", durationMs: 1 },
      { spanId: "b", durationMs: 2 },
    ]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][1]).toEqual({
      unknownKeys: ["spans[].hasError", "spans[].startNs"],
    });
  });

  it("still rejects a missing required field", () => {
    expect(() => validateResponse(envelopeSchema, { spans: [{ spanId: "a" }] })).toThrow();
  });

  it("reports nothing when the wire matches the schema", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    validateResponse(envelopeSchema, { spans: [{ spanId: "a", durationMs: 1 }] });
    expect(warn).not.toHaveBeenCalled();
  });
});
