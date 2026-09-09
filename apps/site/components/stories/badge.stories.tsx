import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@/components/ui/badge";

/**
 * The hero eyebrow pill ("Free • Open source • MIT licensed • Self-hosted")
 * generalised to one badge per fact, so the same piece can label a platform
 * or a form type wherever a submission needs a short tag.
 */
const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "padded" },
  args: { children: "Self-hosted", tone: "accent" },
  argTypes: {
    tone: { control: "select", options: ["accent", "sky", "neutral"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The eyebrow facts, each its own badge instead of one bullet-joined string. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="accent">Free</Badge>
      <Badge tone="accent">Open source</Badge>
      <Badge tone="sky">MIT licensed</Badge>
      <Badge tone="neutral">Self-hosted</Badge>
    </div>
  ),
};

/** In context: the platform a submission came in on, next to which form it filled out. */
export const InARow: Story = {
  render: () => (
    <ul className="max-w-md divide-y divide-line rounded-2xl border border-line bg-panel text-sm">
      {[
        ["ios", "Bug report"],
        ["android", "Feature request"],
        ["web", "Bug report"],
        ["server", "Feature request"],
      ].map(([platform, form]) => (
        <li key={platform} className="flex items-center justify-between p-3">
          <span className="text-fg">{form}</span>
          <Badge tone={platform === "web" || platform === "server" ? "sky" : "neutral"}>
            {platform}
          </Badge>
        </li>
      ))}
    </ul>
  ),
};
