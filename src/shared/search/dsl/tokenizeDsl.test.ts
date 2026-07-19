import { describe, expect, it } from "vitest";

import { tokenizeDsl } from "./tokenizeDsl";

describe("tokenizeDsl", () => {
  it("splits on whitespace", () => {
    const toks = tokenizeDsl("a b\tc");
    expect(toks.map((t) => t.raw)).toEqual(["a", "b", "c"]);
    expect(toks.every((t) => t.kind === "bare")).toBe(true);
  });

  it("keeps quoted strings as one token", () => {
    const [tok] = tokenizeDsl('"hello world"');
    expect(tok.kind).toBe("quoted");
    expect(tok.value).toBe("hello world");
  });

  it("tolerates an unterminated quote to end of input", () => {
    const [tok] = tokenizeDsl('"partial');
    expect(tok.kind).toBe("quoted");
    expect(tok.value).toBe("partial");
  });

  it("splits kv on the first colon only", () => {
    const [tok] = tokenizeDsl("@http.url:https://x");
    expect(tok.kind).toBe("kv");
    expect(tok.key).toBe("@http.url");
    expect(tok.value).toBe("https://x");
  });

  it("does not treat a leading colon as kv", () => {
    const [tok] = tokenizeDsl(":oops");
    expect(tok.kind).toBe("bare");
  });

  it("keeps parenthesized OR groups in one token", () => {
    const [tok] = tokenizeDsl("service:(a OR b)");
    expect(tok.kind).toBe("kv");
    expect(tok.value).toBe("(a OR b)");
  });

  it("records offsets for error highlighting", () => {
    const toks = tokenizeDsl("aa bb");
    expect(toks[1].offset).toBe(3);
    expect(toks[1].length).toBe(2);
  });
});
