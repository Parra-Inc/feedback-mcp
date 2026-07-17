import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "@/lib/config/load";

let configDir: string;

function writeProject(slug: string, project: object, forms: Record<string, object>) {
  const projectDir = path.join(configDir, "projects", slug);
  fs.mkdirSync(path.join(projectDir, "forms"), { recursive: true });
  fs.writeFileSync(path.join(projectDir, "project.json"), JSON.stringify(project));
  for (const [formSlug, form] of Object.entries(forms)) {
    fs.writeFileSync(path.join(projectDir, "forms", `${formSlug}.json`), JSON.stringify(form));
  }
}

const validProject = {
  slug: "my-app",
  name: "My App",
  ingestKeys: [{ id: "default", secretEnv: "MY_APP_KEY" }],
};

const validForm = {
  slug: "bug-report",
  name: "Bug Report",
  fields: [{ name: "title", type: "string", required: true }],
};

beforeEach(() => {
  configDir = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-mcp-config-"));
  process.env.CONFIG_DIR = configDir;
});

afterEach(() => {
  delete process.env.CONFIG_DIR;
  fs.rmSync(configDir, { recursive: true, force: true });
});

describe("loadConfig", () => {
  it("loads a valid config tree", () => {
    writeProject("my-app", validProject, { "bug-report": validForm });
    const { projects } = loadConfig({ force: true });
    expect(projects).toHaveLength(1);
    expect(projects[0].slug).toBe("my-app");
    expect(projects[0].forms.map((form) => form.slug)).toEqual(["bug-report"]);
  });

  it("throws when the project slug does not match its directory", () => {
    writeProject("wrong-dir", validProject, { "bug-report": validForm });
    expect(() => loadConfig({ force: true })).toThrow(ConfigError);
    expect(() => loadConfig({ force: true })).toThrow(/must match its directory name/);
  });

  it("throws when a form slug does not match its file name", () => {
    writeProject("my-app", validProject, { "other-name": validForm });
    expect(() => loadConfig({ force: true })).toThrow(/must match its file name/);
  });

  it("throws on invalid JSON", () => {
    writeProject("my-app", validProject, { "bug-report": validForm });
    fs.writeFileSync(path.join(configDir, "projects", "my-app", "project.json"), "{nope");
    expect(() => loadConfig({ force: true })).toThrow(/Invalid JSON/);
  });

  it("throws when a project has no forms", () => {
    writeProject("my-app", validProject, {});
    expect(() => loadConfig({ force: true })).toThrow(/has no forms/);
  });

  it("throws when config validation fails", () => {
    writeProject("my-app", { slug: "my-app", name: "My App", ingestKeys: [] }, { "bug-report": validForm });
    expect(() => loadConfig({ force: true })).toThrow(/Invalid config/);
  });

  it("throws when the config directory is missing", () => {
    fs.rmSync(configDir, { recursive: true, force: true });
    expect(() => loadConfig({ force: true })).toThrow(/Config directory not found/);
  });
});
