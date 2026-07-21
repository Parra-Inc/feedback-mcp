// Bundles the config/projects tree into lib/config/generated.json so it can be
// loaded without filesystem access at runtime. Cloudflare Workers cannot read
// an arbitrary directory tree at request time, so the D1/Workers deployment
// reads this bundle instead (gated by CONFIG_SOURCE=bundle). Node deployments
// (Vercel, Docker) keep reading the filesystem directly for hot-reload in dev.
//
// The output is raw, unvalidated JSON; lib/config/load.ts runs the same Zod
// validation over it that the filesystem path uses, so config errors surface
// identically regardless of source.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(here, "..");
const configDir = process.env.CONFIG_DIR || path.join(serverDir, "config");
const projectsDir = path.join(configDir, "projects");
const outPath = path.join(serverDir, "lib", "config", "generated.json");

if (!existsSync(projectsDir)) {
  console.error(`[build-config] no projects dir at ${projectsDir}`);
  process.exit(1);
}

const projects = [];

for (const dirName of readdirSync(projectsDir).sort()) {
  const projectDir = path.join(projectsDir, dirName);
  const projectFile = path.join(projectDir, "project.json");
  if (!existsSync(projectFile)) continue;

  const projectJson = JSON.parse(readFileSync(projectFile, "utf8"));

  const forms = [];
  const formsDir = path.join(projectDir, "forms");
  if (existsSync(formsDir)) {
    for (const file of readdirSync(formsDir)
      .filter((f) => f.endsWith(".json"))
      .sort()) {
      forms.push({
        fileBase: file.replace(/\.json$/, ""),
        formJson: JSON.parse(readFileSync(path.join(formsDir, file), "utf8")),
      });
    }
  }

  projects.push({ dirName, projectJson, forms });
}

const bundle = { projects };
writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(
  `[build-config] wrote ${projects.length} project(s) to ${path.relative(serverDir, outPath)}`
);
