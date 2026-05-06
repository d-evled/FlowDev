import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses defaults", () => {
    const c = loadConfig({});
    expect(c.port).toBe(8080);
    expect(c.host).toBe("0.0.0.0");
    expect(c.ready).toBe(true);
    expect(c.gitSha).toBe("unknown");
    expect(c.buildTime).toBe("unknown");
    expect(c.packageVersion).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("reads GIT_SHA and BUILD_TIME", () => {
    const c = loadConfig({
      GIT_SHA: "deadbeef",
      BUILD_TIME: "2026-05-05T12:00:00Z",
    });
    expect(c.gitSha).toBe("deadbeef");
    expect(c.buildTime).toBe("2026-05-05T12:00:00Z");
  });

  it("throws on invalid PORT", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow();
  });
});
