import { afterEach, describe, expect, it } from "vitest";
import { getBearerToken, safeEqual } from "@/lib/auth/secret";
import { verifyAdminRequest, verifyMcpToken } from "@/lib/auth/admin";
import { verifyIngestKey } from "@/lib/auth/ingest";
import {
  ACCESS_TOKEN_PREFIX,
  nowSeconds,
  signOAuthToken,
} from "@/lib/auth/oauth";
import type { LoadedProject } from "@/lib/config/load";

const project: LoadedProject = {
  slug: "my-app",
  name: "My App",
  ingestKeys: [{ id: "default", secretEnv: "TEST_INGEST_KEY" }],
  forms: [],
};

function requestWith(headers: Record<string, string>) {
  return new Request("http://localhost/test", { headers });
}

afterEach(() => {
  delete process.env.MCP_SECRET;
  delete process.env.TEST_INGEST_KEY;
});

describe("safeEqual", () => {
  it("matches equal strings", () => {
    expect(safeEqual("secret", "secret")).toBe(true);
  });
  it("rejects different strings and lengths", () => {
    expect(safeEqual("secret", "secret2")).toBe(false);
    expect(safeEqual("a", "b")).toBe(false);
  });
});

describe("getBearerToken", () => {
  it("strips the Bearer prefix", () => {
    expect(getBearerToken(requestWith({ authorization: "Bearer abc" }))).toBe("abc");
  });
  it("accepts a bare token", () => {
    expect(getBearerToken(requestWith({ authorization: "abc" }))).toBe("abc");
  });
  it("returns null without a header", () => {
    expect(getBearerToken(requestWith({}))).toBeNull();
  });
});

describe("verifyAdminRequest", () => {
  it("fails with 500 when MCP_SECRET is unset", () => {
    const result = verifyAdminRequest(requestWith({ authorization: "Bearer x" }));
    expect(result).toMatchObject({ success: false, status: 500 });
  });

  it("rejects a wrong token", () => {
    process.env.MCP_SECRET = "right";
    const result = verifyAdminRequest(requestWith({ authorization: "Bearer wrong" }));
    expect(result).toMatchObject({ success: false, status: 401 });
  });

  it("accepts the raw secret", () => {
    process.env.MCP_SECRET = "right";
    expect(verifyAdminRequest(requestWith({ authorization: "Bearer right" }))).toEqual({
      success: true,
    });
  });

  it("accepts an OAuth access token issued by this instance", () => {
    process.env.MCP_SECRET = "right";
    const token =
      ACCESS_TOKEN_PREFIX + signOAuthToken({ t: "access", exp: nowSeconds() + 60 }, "right");
    expect(verifyMcpToken(token)).toBe(true);
    expect(verifyAdminRequest(requestWith({ authorization: `Bearer ${token}` }))).toEqual({
      success: true,
    });
  });

  it("rejects a refresh token used as an access token", () => {
    process.env.MCP_SECRET = "right";
    const token =
      ACCESS_TOKEN_PREFIX + signOAuthToken({ t: "refresh", exp: nowSeconds() + 60 }, "right");
    expect(verifyMcpToken(token)).toBe(false);
  });
});

describe("verifyIngestKey", () => {
  it("rejects a missing header", () => {
    process.env.TEST_INGEST_KEY = "pk_test";
    expect(verifyIngestKey(requestWith({}), project)).toMatchObject({
      success: false,
      status: 401,
    });
  });

  it("rejects a wrong key", () => {
    process.env.TEST_INGEST_KEY = "pk_test";
    expect(verifyIngestKey(requestWith({ "x-feedback-key": "nope" }), project)).toMatchObject({
      success: false,
    });
  });

  it("accepts the configured key and reports which key matched", () => {
    process.env.TEST_INGEST_KEY = "pk_test";
    expect(verifyIngestKey(requestWith({ "x-feedback-key": "pk_test" }), project)).toEqual({
      success: true,
      keyId: "default",
    });
  });

  it("rejects when the referenced env var is unset", () => {
    expect(verifyIngestKey(requestWith({ "x-feedback-key": "pk_test" }), project)).toMatchObject({
      success: false,
    });
  });
});
