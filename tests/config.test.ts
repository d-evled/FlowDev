import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses defaults", () => {
    const c = loadConfig({});
    expect(c.port).toBe(8080);
    expect(c.host).toBe("0.0.0.0");
    expect(c.ready).toBe(true);
  });

  it("throws on invalid PORT", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow();
  });
});
