import { SignJWT } from "jose";
import { afterEach, describe, expect, it } from "vitest";
import { verifyUserToken } from "@/lib/auth/user-jwt";
import type { LoadedProject } from "@/lib/config/load";

const SECRET = "jwt-test-secret";

function project(jwt?: object): LoadedProject {
  return {
    slug: "my-app",
    name: "My App",
    ingestKeys: [{ id: "default", secretEnv: "X" }],
    forms: [],
    ...(jwt ? { auth: { jwt: jwt as never } } : {}),
  };
}

const hmacJwtConfig = {
  issuer: "https://issuer.test",
  audience: "my-app",
  algorithms: ["HS256"],
  secretEnv: "TEST_JWT_SECRET",
  required: false,
};

async function signToken(overrides: { issuer?: string; audience?: string; secret?: string } = {}) {
  return new SignJWT({ sub: "user_42" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(overrides.issuer ?? "https://issuer.test")
    .setAudience(overrides.audience ?? "my-app")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(overrides.secret ?? SECRET));
}

function requestWith(token?: string) {
  return new Request("http://localhost/test", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

afterEach(() => {
  delete process.env.TEST_JWT_SECRET;
});

describe("verifyUserToken", () => {
  it("is anonymous when the project has no jwt config", async () => {
    const result = await verifyUserToken(requestWith("anything"), project());
    expect(result).toEqual({ success: true, userId: null });
  });

  it("is anonymous when no token is sent and jwt is optional", async () => {
    process.env.TEST_JWT_SECRET = SECRET;
    const result = await verifyUserToken(requestWith(), project(hmacJwtConfig));
    expect(result).toEqual({ success: true, userId: null });
  });

  it("rejects a missing token when jwt is required", async () => {
    process.env.TEST_JWT_SECRET = SECRET;
    const result = await verifyUserToken(
      requestWith(),
      project({ ...hmacJwtConfig, required: true })
    );
    expect(result).toMatchObject({ success: false, status: 401 });
  });

  it("verifies a valid token and extracts sub", async () => {
    process.env.TEST_JWT_SECRET = SECRET;
    const result = await verifyUserToken(requestWith(await signToken()), project(hmacJwtConfig));
    expect(result).toEqual({ success: true, userId: "user_42" });
  });

  it("rejects a token signed with the wrong secret", async () => {
    process.env.TEST_JWT_SECRET = SECRET;
    const result = await verifyUserToken(
      requestWith(await signToken({ secret: "attacker" })),
      project(hmacJwtConfig)
    );
    expect(result).toMatchObject({ success: false, status: 401 });
  });

  it("rejects issuer and audience mismatches", async () => {
    process.env.TEST_JWT_SECRET = SECRET;
    const badIssuer = await verifyUserToken(
      requestWith(await signToken({ issuer: "https://evil.test" })),
      project(hmacJwtConfig)
    );
    expect(badIssuer).toMatchObject({ success: false });

    const badAudience = await verifyUserToken(
      requestWith(await signToken({ audience: "other-app" })),
      project(hmacJwtConfig)
    );
    expect(badAudience).toMatchObject({ success: false });
  });

  it("fails with 500 when the secret env var is unset", async () => {
    const result = await verifyUserToken(requestWith(await signToken()), project(hmacJwtConfig));
    expect(result).toMatchObject({ success: false, status: 500 });
  });
});
