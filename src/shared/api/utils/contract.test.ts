import { describe, expect, it } from "vitest";
import { z } from "zod";

import { redSchemas } from "@shared/api/red/redApi";
import {
  criticalPathSpanSchema,
  errorPathSpanSchema,
  relatedTraceSchema,
  spanAttributesSchema,
  spanEventSchema,
  spanRecordSchema,
  traceErrorGroupSchema,
  traceLogSchema,
} from "@shared/api/traces/schemas";
import fixtures from "./__fixtures__.json";

/**
 * Fixtures are emitted by marshalling the real Go response structs, so these
 * assert the Zod schemas against the true wire shape rather than a hand-copy
 * of it. Each fixture includes a zero-valued element: that is what proves
 * which keys survive `omitempty` when every field is empty.
 */
const cases: ReadonlyArray<readonly [string, z.ZodTypeAny]> = [
  ["traceSpansEnvelope", z.object({ spans: z.array(spanRecordSchema) })],
  ["spanEvents", z.array(spanEventSchema)],
  ["spanAttributes", spanAttributesSchema],
  ["spanAttributesFull", spanAttributesSchema],
  ["relatedTraces", z.array(relatedTraceSchema)],
  ["criticalPath", z.array(criticalPathSpanSchema)],
  ["errorPath", z.array(errorPathSpanSchema)],
  ["traceErrors", z.array(traceErrorGroupSchema)],
  ["traceLogs", z.array(traceLogSchema)],
  ...Object.entries(redSchemas),
];

describe("wire contract: Go structs parse against the web schemas", () => {
  for (const [name, schema] of cases) {
    it(`${name} parses`, () => {
      const result = schema.safeParse((fixtures as Record<string, unknown>)[name]);
      expect(result.success ? null : result.error.issues).toBeNull();
    });
  }
});
