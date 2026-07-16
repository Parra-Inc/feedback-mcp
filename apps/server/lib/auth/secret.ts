import { createHash, timingSafeEqual } from "node:crypto";

// Constant-time string comparison. Hashing both sides first means inputs of
// different lengths can still be compared without leaking length info.
export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}
