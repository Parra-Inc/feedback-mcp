import { createHash, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  nowSeconds,
  signOAuthToken,
  verifyOAuthToken,
  verifyPkce,
} from "@/lib/auth/oauth";

const SECRET = "oauth-test-secret";

describe("OAuth tokens", () => {
  it("round-trips a signed payload", () => {
    const token = signOAuthToken(
      { t: "code", exp: nowSeconds() + 60, challenge: "abc", redirectUri: "https://x.dev/cb" },
      SECRET
    );
    const payload = verifyOAuthToken(token, SECRET);
    expect(payload).toMatchObject({ t: "code", challenge: "abc", redirectUri: "https://x.dev/cb" });
  });

  it("rejects a tampered token", () => {
    const token = signOAuthToken({ t: "access", exp: nowSeconds() + 60 }, SECRET);
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ t: "access", exp: nowSeconds() + 9999 })).toString(
      "base64url"
    );
    expect(verifyOAuthToken(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(verifyOAuthToken(`${body}.AAAA`, SECRET)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = signOAuthToken({ t: "access", exp: nowSeconds() + 60 }, "other-secret");
    expect(verifyOAuthToken(token, SECRET)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signOAuthToken({ t: "access", exp: nowSeconds() - 1 }, SECRET);
    expect(verifyOAuthToken(token, SECRET)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyOAuthToken("not-a-token", SECRET)).toBeNull();
    expect(verifyOAuthToken("a.b", SECRET)).toBeNull();
  });
});

describe("PKCE", () => {
  it("verifies a correct S256 verifier", () => {
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    expect(verifyPkce(verifier, challenge)).toBe(true);
  });

  it("rejects a wrong verifier", () => {
    const challenge = createHash("sha256").update("right").digest("base64url");
    expect(verifyPkce("wrong", challenge)).toBe(false);
  });
});
