const { z } = require('zod');

const schema = z.object({
  a: z.string(),
  has_error: z.boolean().default(false),
  start_ns: z.number().default(0),
}).strict();

try {
  schema.parse({ a: "test", has_error: true, start_ns: 123 });
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:", e.errors);
}
