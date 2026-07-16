import type { FormConfig, ProjectConfig } from "@/lib/config/schema";

interface SlackFeedbackMessage {
  project: ProjectConfig;
  form: FormConfig;
  feedbackId: string;
  platform: string | null;
  data: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  userId: string | null;
  createdAt: Date;
}

function truncate(value: string, max = 500): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

// Cross-posts a feedback submission to Slack after it has been written to
// the database. Fire-and-forget by design: a Slack outage must never fail or
// slow down the ingest endpoint, so every failure path just logs.
export async function postFeedbackToSlack(message: SlackFeedbackMessage): Promise<void> {
  const webhookUrl =
    (message.project.slackWebhookEnv && process.env[message.project.slackWebhookEnv]) ||
    process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const contextParts = [
    `*Project:* ${message.project.name}`,
    `*Form:* ${message.form.name}`,
  ];
  if (message.platform) contextParts.push(`*Platform:* ${message.platform}`);
  if (message.userId) contextParts.push(`*User:* ${message.userId}`);

  const dataLines = Object.entries(message.data)
    .map(([key, value]) => `*${key}:* ${truncate(formatValue(value))}`)
    .join("\n");

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `New feedback: ${message.form.name}`, emoji: true },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: contextParts.join("  •  ") },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: truncate(dataLines, 2900) },
    },
  ];

  if (message.metadata && Object.keys(message.metadata).length > 0) {
    blocks.push({
      type: "context",
      elements: [
        { type: "mrkdwn", text: truncate(`Metadata: ${JSON.stringify(message.metadata)}`, 500) },
      ],
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `${message.feedbackId} • ${message.createdAt.toISOString()}`,
      },
    ],
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `New feedback for ${message.project.name}: ${message.form.name}`,
        blocks,
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      console.error(`[slack] webhook responded ${response.status}`);
    }
  } catch (error) {
    console.error("[slack] failed to post feedback:", error);
  }
}
