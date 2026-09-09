import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";

/**
 * One filled (primary) button per screen. Accent is the action colour and
 * the only fill; secondary is an outline and ghost is the quiet nav-level
 * action, never the reverse.
 */
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "padded" },
  args: { children: "Get started on GitHub", variant: "primary", size: "md" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The three variants on the page today: the hero fill, the "How it works" outline, and the nav GitHub link. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Get started on GitHub</Button>
      <Button variant="secondary">How it works</Button>
      <Button variant="ghost" size="sm">
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  ),
};

/** sm is the nav link, md is the default CTA size, lg is the wider footer CTA. All three sizes above sm are h-12. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Approve</Button>
      <Button size="md">Get started on GitHub</Button>
      <Button size="lg">View on GitHub</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <GitHubIcon />
        Get started on GitHub
      </Button>
      <Button variant="secondary">
        <GitHubIcon />
        View on GitHub
      </Button>
      <Button variant="ghost" size="sm">
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  ),
};

/** Disabled is opacity only, so the variant still reads. Shown mid-submit, the state a real ingest form would hit. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Sending...</Button>
      <Button variant="secondary" disabled>
        How it works
      </Button>
      <Button variant="ghost" size="sm" disabled>
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  ),
};

/** The same classes on an anchor, the way every CTA on the marketing page is actually rendered. */
export const AsLink: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button href="https://github.com/Parra-Inc/feedback-mcp" size="lg">
        View on GitHub
      </Button>
      <Button href="#how-it-works" variant="secondary" size="lg">
        How it works
      </Button>
    </div>
  ),
};
