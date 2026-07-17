// Minimal Feedback MCP client for web, Node.js, or React Native.
// Copy into your project and adjust the config.

export interface FeedbackClientConfig {
  /** Your instance, e.g. "https://feedback.your-domain.com" */
  endpoint: string;
  /** Project slug from config/projects/<slug> */
  project: string;
  /** The project's ingest key (safe to ship in clients; it can only submit) */
  ingestKey: string;
  /** "ios" | "android" | "web" | anything your project allows */
  platform?: string;
}

export interface SubmitFeedbackOptions {
  /** Form slug, e.g. "bug-report" */
  form: string;
  /** Must match the form's field schema */
  data: Record<string, unknown>;
  /** Anything useful for triage: app version, locale, device */
  metadata?: Record<string, unknown>;
  /** Optional end-user JWT if the project has auth.jwt configured */
  userToken?: string;
}

export class FeedbackError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FeedbackError";
  }
}

export async function submitFeedback(
  config: FeedbackClientConfig,
  options: SubmitFeedbackOptions
): Promise<{ id: string; createdAt: string }> {
  const response = await fetch(`${config.endpoint}/api/v1/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Feedback-Key": config.ingestKey,
      ...(options.userToken ? { Authorization: `Bearer ${options.userToken}` } : {}),
    },
    body: JSON.stringify({
      project: config.project,
      form: options.form,
      platform: config.platform,
      data: options.data,
      metadata: options.metadata,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new FeedbackError(
      response.status,
      (body as { error?: string }).error ?? `Request failed with ${response.status}`,
      (body as { details?: unknown }).details
    );
  }
  return (body as { feedback: { id: string; createdAt: string } }).feedback;
}

// Usage:
//
// const feedback = await submitFeedback(
//   {
//     endpoint: "https://feedback.your-domain.com",
//     project: "my-app",
//     ingestKey: "pk_...",
//     platform: "web",
//   },
//   {
//     form: "bug-report",
//     data: { title: "Crash on launch", description: "...", severity: "high" },
//     metadata: { appVersion: "1.2.0", locale: navigator.language },
//   }
// );
