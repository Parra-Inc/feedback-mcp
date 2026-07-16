import type { LoadedProject } from "@/lib/config/load";
import { safeEqual } from "./secret";

export type IngestAuthResult =
  | { success: true; keyId: string }
  | { success: false; error: string; status: number };

// Ingest keys authorize feedback submission for a single project. The
// project config references keys by env var name (secretEnv) so the actual
// secrets stay out of git.
export function verifyIngestKey(
  request: Request,
  project: LoadedProject
): IngestAuthResult {
  const provided = request.headers.get("x-feedback-key");
  if (!provided) {
    return { success: false, error: "Missing X-Feedback-Key header", status: 401 };
  }

  for (const key of project.ingestKeys) {
    const secret = process.env[key.secretEnv];
    if (secret && safeEqual(provided, secret)) {
      return { success: true, keyId: key.id };
    }
  }

  return { success: false, error: "Invalid feedback key", status: 401 };
}
