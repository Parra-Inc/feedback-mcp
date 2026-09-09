import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const config: StorybookConfig = {
  // apps/site is the only app with a design system (Tailwind v4). apps/server
  // is a bare, unstyled status page with inline style objects, nothing
  // repeated worth extracting, and no Tailwind at all.
  stories: ["../apps/site/components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  staticDirs: ["../apps/site/public"],
  viteFinal: (vite) => ({
    ...vite,
    plugins: [...(vite.plugins ?? []), tailwind()],
    resolve: {
      ...vite.resolve,
      alias: [
        ...(Array.isArray(vite.resolve?.alias)
          ? vite.resolve.alias
          : Object.entries(vite.resolve?.alias ?? {}).map(([find, replacement]) => ({
              find,
              replacement: replacement as string,
            }))),
        { find: /^next\/image$/, replacement: resolve(here, "shims/next-image.tsx") },
        { find: /^next\/link$/, replacement: resolve(here, "shims/next-link.tsx") },
        // Single Next app for this Storybook: a plain alias is enough.
        { find: /^@\//, replacement: `${resolve(root, "apps/site")}/` },
      ],
    },
  }),
};

export default config;
