import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  formConfigSchema,
  projectConfigSchema,
  type FormConfig,
  type ProjectConfig,
} from "./schema";
import generatedConfig from "./generated.json";

export class ConfigError extends Error {}

export type LoadedProject = ProjectConfig & { forms: FormConfig[] };
export type LoadedConfig = { projects: LoadedProject[] };

// A project directory read from either the filesystem or the build-time
// bundle, before Zod validation. Both sources funnel through validateEntries
// so config errors are identical regardless of where the data came from.
interface RawProjectEntry {
  dirName: string;
  projectJson: unknown;
  forms: { fileBase: string; formJson: unknown }[];
}

let cache: LoadedConfig | null = null;

export function getConfigDir(): string {
  return process.env.CONFIG_DIR || path.join(process.cwd(), "config");
}

// Projects and forms are declarative config, not database rows. The tree is
// read once and cached in production; in development it is re-read on every
// call so config edits show up without a restart.
//
// Source of the raw data:
//   - CONFIG_SOURCE=bundle (Cloudflare Workers / D1): the build-time bundle
//     in generated.json, since Workers cannot walk a directory at runtime.
//   - otherwise (Node: local dev, Vercel, Docker): the filesystem, so config
//     edits hot-reload in dev.
export function loadConfig(options: { force?: boolean } = {}): LoadedConfig {
  const useCache = process.env.NODE_ENV === "production" && !options.force;
  if (cache && useCache) return cache;

  const entries =
    process.env.CONFIG_SOURCE === "bundle" ? readFromBundle() : readFromFilesystem();

  const result = validateEntries(entries);
  cache = result;
  return result;
}

function readFromBundle(): RawProjectEntry[] {
  const bundle = generatedConfig as { projects?: RawProjectEntry[] };
  if (!bundle.projects || bundle.projects.length === 0) {
    throw new ConfigError(
      "CONFIG_SOURCE=bundle but generated.json is empty. Run `pnpm build:config` to regenerate it from config/projects."
    );
  }
  return bundle.projects;
}

function readFromFilesystem(): RawProjectEntry[] {
  const projectsDir = path.join(getConfigDir(), "projects");
  if (!fs.existsSync(projectsDir)) {
    throw new ConfigError(
      `Config directory not found: ${projectsDir}. Create config/projects/<slug>/project.json (see config/projects/example-app).`
    );
  }

  const entries: RawProjectEntry[] = [];

  for (const entry of fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;

    const projectDir = path.join(projectsDir, entry.name);
    const projectFile = path.join(projectDir, "project.json");
    if (!fs.existsSync(projectFile)) {
      throw new ConfigError(`Missing project.json in ${projectDir}`);
    }

    const forms: RawProjectEntry["forms"] = [];
    const formsDir = path.join(projectDir, "forms");
    if (fs.existsSync(formsDir)) {
      for (const file of fs
        .readdirSync(formsDir)
        .filter((file) => file.endsWith(".json"))
        .sort()) {
        forms.push({
          fileBase: file.replace(/\.json$/, ""),
          formJson: readJsonFile(path.join(formsDir, file)),
        });
      }
    }

    entries.push({
      dirName: entry.name,
      projectJson: readJsonFile(projectFile),
      forms,
    });
  }

  return entries;
}

function validateEntries(entries: RawProjectEntry[]): LoadedConfig {
  const projects: LoadedProject[] = [];

  for (const entry of entries) {
    const project = parseConfig(projectConfigSchema, entry.projectJson, `project "${entry.dirName}"`);
    if (project.slug !== entry.dirName) {
      throw new ConfigError(
        `Project slug "${project.slug}" must match its directory name "${entry.dirName}"`
      );
    }

    const forms: FormConfig[] = [];
    for (const rawForm of entry.forms) {
      const form = parseConfig(
        formConfigSchema,
        rawForm.formJson,
        `form "${entry.dirName}/${rawForm.fileBase}"`
      );
      if (form.slug !== rawForm.fileBase) {
        throw new ConfigError(
          `Form slug "${form.slug}" must match its file name "${rawForm.fileBase}" (project "${entry.dirName}")`
        );
      }
      forms.push(form);
    }

    if (forms.length === 0) {
      throw new ConfigError(
        `Project "${project.slug}" has no forms. Add at least one form in config/projects/${entry.dirName}/forms/<slug>.json`
      );
    }

    projects.push({ ...project, forms });
  }

  if (projects.length === 0) {
    throw new ConfigError(
      "No projects found. Create config/projects/<slug>/project.json (see config/projects/example-app)."
    );
  }

  return { projects };
}

function readJsonFile(filePath: string): unknown {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new ConfigError(`Could not read ${filePath}: ${(error as Error).message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ConfigError(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }
}

function parseConfig<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
  label: string
): z.output<Schema> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ConfigError(`Invalid config in ${label}:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

export function getProject(slug: string): LoadedProject | null {
  return loadConfig().projects.find((project) => project.slug === slug) ?? null;
}

export function getForm(project: LoadedProject, formSlug: string): FormConfig | null {
  return project.forms.find((form) => form.slug === formSlug) ?? null;
}
