import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  formConfigSchema,
  projectConfigSchema,
  type FormConfig,
  type ProjectConfig,
} from "./schema";

export class ConfigError extends Error {}

export type LoadedProject = ProjectConfig & { forms: FormConfig[] };
export type LoadedConfig = { projects: LoadedProject[] };

let cache: LoadedConfig | null = null;

export function getConfigDir(): string {
  return process.env.CONFIG_DIR || path.join(process.cwd(), "config");
}

// Projects and forms are declarative config, not database rows. The tree is
// read once and cached in production; in development it is re-read on every
// call so config edits show up without a restart.
export function loadConfig(options: { force?: boolean } = {}): LoadedConfig {
  const useCache = process.env.NODE_ENV === "production" && !options.force;
  if (cache && useCache) return cache;

  const projectsDir = path.join(getConfigDir(), "projects");
  if (!fs.existsSync(projectsDir)) {
    throw new ConfigError(
      `Config directory not found: ${projectsDir}. Create config/projects/<slug>/project.json (see config/projects/example-app).`
    );
  }

  const projects: LoadedProject[] = [];

  for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;

    const projectDir = path.join(projectsDir, entry.name);
    const projectFile = path.join(projectDir, "project.json");
    if (!fs.existsSync(projectFile)) {
      throw new ConfigError(`Missing project.json in ${projectDir}`);
    }

    const project = parseJsonFile(projectFile, projectConfigSchema);
    if (project.slug !== entry.name) {
      throw new ConfigError(
        `Project slug "${project.slug}" must match its directory name "${entry.name}" (${projectFile})`
      );
    }

    const forms: FormConfig[] = [];
    const formsDir = path.join(projectDir, "forms");
    if (fs.existsSync(formsDir)) {
      for (const file of fs
        .readdirSync(formsDir)
        .filter((file) => file.endsWith(".json"))
        .sort()) {
        const formFile = path.join(formsDir, file);
        const form = parseJsonFile(formFile, formConfigSchema);
        const expectedSlug = file.replace(/\.json$/, "");
        if (form.slug !== expectedSlug) {
          throw new ConfigError(
            `Form slug "${form.slug}" must match its file name "${expectedSlug}" (${formFile})`
          );
        }
        forms.push(form);
      }
    }

    if (forms.length === 0) {
      throw new ConfigError(
        `Project "${project.slug}" has no forms. Add at least one form in ${formsDir}/<slug>.json`
      );
    }

    projects.push({ ...project, forms });
  }

  if (projects.length === 0) {
    throw new ConfigError(
      `No projects found in ${projectsDir}. Create config/projects/<slug>/project.json (see config/projects/example-app).`
    );
  }

  const result: LoadedConfig = { projects };
  cache = result;
  return result;
}

function parseJsonFile<Schema extends z.ZodType>(
  filePath: string,
  schema: Schema
): z.output<Schema> {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new ConfigError(`Could not read ${filePath}: ${(error as Error).message}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new ConfigError(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ConfigError(`Invalid config in ${filePath}:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

export function getProject(slug: string): LoadedProject | null {
  return loadConfig().projects.find((project) => project.slug === slug) ?? null;
}

export function getForm(project: LoadedProject, formSlug: string): FormConfig | null {
  return project.forms.find((form) => form.slug === formSlug) ?? null;
}
