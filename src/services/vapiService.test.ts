import { describe, expect, it } from "vitest";
import { resolveVapiConstructor } from "./vapiService";

class Fake {}

describe("resolveVapiConstructor", () => {
  it("accepts a module whose default is the class", () => {
    expect(resolveVapiConstructor({ default: Fake })).toBe(Fake);
  });
  it("accepts a CommonJS-wrapped module (default.default)", () => {
    expect(resolveVapiConstructor({ __esModule: true, default: { __esModule: true, default: Fake } })).toBe(Fake);
  });
  it("accepts the class itself", () => {
    expect(resolveVapiConstructor(Fake)).toBe(Fake);
  });
  it("throws a clear error when there is no constructor", () => {
    expect(() => resolveVapiConstructor({ default: {} })).toThrow(/constructor/);
    expect(() => resolveVapiConstructor(undefined)).toThrow(/constructor/);
  });
  it("resolves the real @vapi-ai/web package to a constructor (regression: 'i is not a constructor')", async () => {
    const Ctor = resolveVapiConstructor(await import("@vapi-ai/web"));
    expect(typeof Ctor).toBe("function");
  });
});
