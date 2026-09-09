import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "@/components/ui/card";

/**
 * The raised panel the "How it works" steps, the feature grid and the FAQ
 * entries are each built from independently: one border, one radius, one
 * ground (bg-panel), no variant. Every usage on the page is p-6.
 */
const meta = {
  title: "Components/Card",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A feature-grid tile: title, one line of body copy. */
export const Basic: Story = {
  render: () => (
    <Card className="max-w-sm">
      <h3 className="font-semibold text-fg">Built-in MCP server</h3>
      <p className="mt-2 text-sm text-muted">
        Connect Claude Code, Claude Desktop, or any MCP client to /api/mcp and query your
        feedback with tools like list_feedback, search_feedback, and feedback_stats.
      </p>
    </Card>
  ),
};

/** A "How it works" step: the numbered circle, a title, body copy, and a code sample. */
export const StepCard: Story = {
  render: () => (
    <Card className="max-w-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
        2
      </div>
      <h3 className="mt-4 font-semibold text-fg">Send feedback from your app</h3>
      <p className="mt-2 text-sm text-muted">
        POST submissions with your ingest key. Data is validated against the form schema and
        stored with platform and metadata.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-3 text-xs leading-relaxed text-sky">
        <code>{`POST /api/v1/feedback
X-Feedback-Key: <ingest key>

{
  "project": "my-app",
  "form": "bug-report",
  "platform": "ios"
}`}</code>
      </pre>
    </Card>
  ),
};
