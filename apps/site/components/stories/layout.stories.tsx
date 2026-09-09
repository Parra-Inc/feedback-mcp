import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The single-page marketing site's skeleton: one gutter (px-6), a small set
 * of max widths, alternating border-y/bg-panel/50 section bands, and the
 * hero (h1) vs. section (h2) heading pair every section opens with.
 */
const meta = {
  title: "Components/Layout",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const widths = [
  ["max-w-5xl", "Every section container: nav, hero, features, FAQ wrapper"],
  ["max-w-3xl", "FAQ question list, narrower for a reading column"],
  ["max-w-2xl", "Hero paragraph and the quickstart code block"],
  ["max-w-xl", "Final CTA paragraph"],
] as const;

export const ContainerWidths: Story = {
  render: () => (
    <div className="grid gap-4 py-8">
      {widths.map(([cls, use]) => (
        <div key={cls} className={`mx-auto w-full ${cls} px-6`}>
          <div className="rounded-lg border border-dashed border-sky/50 bg-panel px-3 py-2 text-xs text-muted">
            <span className="font-mono text-sky">{cls}</span> · {use}
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Sections alternate a bare max-w-5xl band and a border-y bg-panel/50 band, each py-16 to py-20. */
export const SectionRhythm: Story = {
  render: () => (
    <div>
      {[
        { title: "How it works", banded: false },
        { title: "Everything you need, nothing you don't", banded: true },
        { title: "Frequently asked questions", banded: true },
      ].map(({ title, banded }) => (
        <div key={title} className={banded ? "border-y border-line bg-panel/50" : undefined}>
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-4 text-center text-sm text-muted">
              Section body sits mt-10 under the heading; every band is py-16 to py-20.
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** h1 carries the eyebrow pill and the accent-highlighted phrase; every other section opens with a plain centered h2. */
export const Headings: Story = {
  render: () => (
    <div className="mx-auto grid max-w-3xl gap-10 px-6 py-10">
      <div>
        <p className="mx-auto mb-4 w-fit rounded-full border border-line bg-panel px-4 py-1 text-xs font-medium tracking-wide text-accent">
          Free • Open source • Self-hosted
        </p>
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          The open-source <span className="rounded-xl bg-accent/15 px-2 text-accent">feedback MCP</span> server
        </h1>
      </div>
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">What is a feedback MCP server?</h2>
      </div>
    </div>
  ),
};
