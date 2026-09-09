import type { Preview } from "@storybook/react-vite";
import "./preview.css";

/*
 * Feedback MCP has one theme: a fixed dark ground (globals.css sets it on
 * `body` directly, no prefers-color-scheme, no data-theme toggle), so there
 * is nothing to add here beyond painting the same ground on the story root.
 */
const preview: Preview = {
  parameters: {
    // The decorator paints the product's ground; Storybook's own canvas
    // colours would review the wrong thing.
    backgrounds: { disable: true },
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Components",
          ["Button", "Badge", "Form controls", "Card", "Layout"],
          "Empty states",
          ["Gallery"],
          "Marketing",
          "Emails",
          "Brand",
        ],
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story, ctx) => {
      const padded = ctx.parameters.layout !== "fullscreen";
      return (
        <div className={`min-h-screen bg-ink text-fg${padded ? " p-6" : ""}`}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
