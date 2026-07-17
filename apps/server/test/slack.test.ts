import { afterEach, describe, expect, it, vi } from "vitest";
import { postFeedbackToSlack } from "@/lib/slack/post";
import type { FormConfig, ProjectConfig } from "@/lib/config/schema";

const project: ProjectConfig = {
  slug: "my-app",
  name: "My App",
  ingestKeys: [{ id: "default", secretEnv: "X" }],
};

const form: FormConfig = {
  slug: "bug-report",
  name: "Bug Report",
  fields: [{ name: "title", type: "string", required: true }],
};

function message() {
  return {
    project,
    form,
    feedbackId: "fb_test",
    platform: "ios",
    data: { title: "It broke" },
    metadata: { appVersion: "1.0" },
    userId: "user_1",
    createdAt: new Date("2026-07-16T12:00:00Z"),
  };
}

afterEach(() => {
  delete process.env.SLACK_WEBHOOK_URL;
  vi.unstubAllGlobals();
});

describe("postFeedbackToSlack", () => {
  it("does nothing when no webhook is configured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await postFeedbackToSlack(message());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts a Block Kit payload to the configured webhook", async () => {
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/abc";
    const fetchSpy = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchSpy);

    await postFeedbackToSlack(message());

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.slack.test/abc");
    const body = JSON.parse(init.body);
    expect(body.text).toContain("My App");
    expect(JSON.stringify(body.blocks)).toContain("It broke");
    expect(JSON.stringify(body.blocks)).toContain("user_1");
  });

  it("never throws when the webhook fails", async () => {
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/abc";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(postFeedbackToSlack(message())).resolves.toBeUndefined();
  });
});
