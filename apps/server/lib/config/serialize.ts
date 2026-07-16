import type { LoadedProject } from "./load";
import type { FormConfig } from "./schema";

// Public shapes for the read API and MCP tools. Env var names (ingest keys,
// JWT keys, Slack webhooks) are internal wiring and are not exposed.
export function serializeProject(project: LoadedProject) {
  return {
    slug: project.slug,
    name: project.name,
    description: project.description ?? null,
    platforms: project.platforms ?? [],
    forms: project.forms.map((form) => ({ slug: form.slug, name: form.name })),
  };
}

export function serializeForm(form: FormConfig) {
  return {
    slug: form.slug,
    name: form.name,
    description: form.description ?? null,
    fields: form.fields,
  };
}
