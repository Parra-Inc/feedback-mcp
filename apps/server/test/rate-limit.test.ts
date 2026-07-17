import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp, resetRateLimits } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("k", 5).allowed).toBe(true);
    }
  });

  it("blocks requests over the limit with a Retry-After hint", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("k", 5);
    const result = checkRateLimit("k", 5);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("resets after the window passes", () => {
    for (let i = 0; i < 6; i++) checkRateLimit("k", 5);
    expect(checkRateLimit("k", 5).allowed).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit("k", 5).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 6; i++) checkRateLimit("a", 5);
    expect(checkRateLimit("a", 5).allowed).toBe(false);
    expect(checkRateLimit("b", 5).allowed).toBe(true);
  });

  it("is disabled when the limit is 0", () => {
    for (let i = 0; i < 1000; i++) {
      expect(checkRateLimit("k", 0).allowed).toBe(true);
    }
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const request = new Request("http://x/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8", "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(getClientIp(new Request("http://x/", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe(
      "9.9.9.9"
    );
    expect(getClientIp(new Request("http://x/"))).toBe("unknown");
  });
});
