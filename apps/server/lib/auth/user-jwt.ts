import { createRemoteJWKSet, importSPKI, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { LoadedProject } from "@/lib/config/load";

export type UserAuthResult =
  | { success: true; userId: string | null }
  | { success: false; error: string; status: number };

const jwksCache = new Map<string, JWTVerifyGetKey>();

function getRemoteJwks(url: string): JWTVerifyGetKey {
  let jwks = jwksCache.get(url);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
    jwksCache.set(url, jwks);
  }
  return jwks;
}

// Optionally attaches a verified end-user identity to a submission. The
// project owner configures how their tokens are signed (JWKS URL, PEM public
// key, or shared HMAC secret); we verify and record the token's `sub`.
export async function verifyUserToken(
  request: Request,
  project: LoadedProject
): Promise<UserAuthResult> {
  const jwt = project.auth?.jwt;
  if (!jwt) return { success: true, userId: null };

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    if (jwt.required) {
      return {
        success: false,
        error: "This project requires an Authorization: Bearer <token> header",
        status: 401,
      };
    }
    return { success: true, userId: null };
  }

  try {
    const options = {
      issuer: jwt.issuer,
      audience: jwt.audience,
      algorithms: jwt.algorithms,
    };

    let payload;
    if (jwt.jwksUrl) {
      ({ payload } = await jwtVerify(token, getRemoteJwks(jwt.jwksUrl), options));
    } else if (jwt.publicKeyEnv) {
      const pem = process.env[jwt.publicKeyEnv];
      if (!pem) {
        return {
          success: false,
          error: `Server is not configured: set the ${jwt.publicKeyEnv} environment variable`,
          status: 500,
        };
      }
      const key = await importSPKI(pem.replace(/\\n/g, "\n"), jwt.algorithms?.[0] ?? "RS256");
      ({ payload } = await jwtVerify(token, key, options));
    } else {
      const secret = jwt.secretEnv ? process.env[jwt.secretEnv] : undefined;
      if (!secret) {
        return {
          success: false,
          error: `Server is not configured: set the ${jwt.secretEnv} environment variable`,
          status: 500,
        };
      }
      ({ payload } = await jwtVerify(token, new TextEncoder().encode(secret), options));
    }

    return { success: true, userId: payload.sub ?? null };
  } catch {
    return { success: false, error: "Invalid user token", status: 401 };
  }
}
