import { describe, expect, it } from "vitest";
import { createId, getModelPrefix } from "@/lib/id";
import { parseJson, serializeJson } from "@/lib/json";

describe("createId", () => {
  it("produces prefixed, url-safe, unique ids", () => {
    const a = createId("fb");
    const b = createId("fb");
    expect(a).toMatch(/^fb_[A-Za-z0-9_-]{16}$/);
    expect(a).not.toBe(b);
  });

  it("maps the Feedback model to the fb prefix", () => {
    expect(getModelPrefix("Feedback")).toBe("fb");
    expect(getModelPrefix("Nope")).toBeUndefined();
  });
});

describe("json helpers", () => {
  it("round-trips values", () => {
    const value = { a: 1, b: ["x", null], c: { nested: true } };
    expect(parseJson(serializeJson(value))).toEqual(value);
  });

  it("returns null for corrupt data instead of throwing", () => {
    expect(parseJson("{not json")).toBeNull();
    expect(parseJson(null)).toBeNull();
  });
});
