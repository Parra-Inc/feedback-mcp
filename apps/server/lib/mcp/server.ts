import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getForm, getProject, loadConfig } from "@/lib/config/load";
import { serializeForm, serializeProject } from "@/lib/config/serialize";
import {
  feedbackStats,
  getFeedbackById,
  listFeedback,
  MAX_PAGE_SIZE,
  searchFeedback,
} from "@/lib/feedback/query";

function ok(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

function fail(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

function parseDate(value: string | undefined): Date | undefined | "invalid" {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid" : date;
}

const projectArg = z
  .string()
  .describe('Project slug (from list_projects), e.g. "example-app"');

const dateArgs = {
  since: z
    .string()
    .optional()
    .describe("Only include feedback created at or after this ISO 8601 date/time"),
  until: z
    .string()
    .optional()
    .describe("Only include feedback created at or before this ISO 8601 date/time"),
};

export function createMcpServer() {
  const server = new McpServer({
    name: "feedback-mcp",
    version: "0.1.0",
  });

  server.tool(
    "list_projects",
    "List all configured projects, including their platforms and forms. Projects are defined in the server's config directory.",
    {},
    async () => {
      const { projects } = loadConfig();
      return ok({ projects: projects.map(serializeProject) });
    }
  );

  server.tool(
    "get_project",
    "Get one project by slug, including its platforms and forms.",
    { project: projectArg },
    async ({ project }) => {
      const found = getProject(project);
      if (!found) return fail(`Unknown project "${project}"`);
      return ok({ project: serializeProject(found) });
    }
  );

  server.tool(
    "list_forms",
    "List the feedback forms defined for a project, including each form's field schema.",
    { project: projectArg },
    async ({ project }) => {
      const found = getProject(project);
      if (!found) return fail(`Unknown project "${project}"`);
      return ok({ forms: found.forms.map(serializeForm) });
    }
  );

  server.tool(
    "get_form",
    "Get a single form definition (name, description, and field schema).",
    {
      project: projectArg,
      form: z.string().describe('Form slug, e.g. "bug-report"'),
    },
    async ({ project, form }) => {
      const foundProject = getProject(project);
      if (!foundProject) return fail(`Unknown project "${project}"`);
      const foundForm = getForm(foundProject, form);
      if (!foundForm) return fail(`Unknown form "${form}" for project "${project}"`);
      return ok({ form: serializeForm(foundForm) });
    }
  );

  server.tool(
    "list_feedback",
    "List feedback submissions for a project, newest first. Supports filtering by form, platform, and date range, and cursor pagination. Use this to read the actual feedback content for analysis.",
    {
      project: projectArg,
      form: z.string().optional().describe("Filter to one form slug"),
      platform: z.string().optional().describe('Filter by platform, e.g. "ios"'),
      ...dateArgs,
      limit: z
        .number()
        .int()
        .min(1)
        .max(MAX_PAGE_SIZE)
        .optional()
        .describe(`Page size (default 50, max ${MAX_PAGE_SIZE})`),
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor: pass the previous response's nextCursor"),
    },
    async ({ project, form, platform, since, until, limit, cursor }) => {
      const foundProject = getProject(project);
      if (!foundProject) return fail(`Unknown project "${project}"`);

      const sinceDate = parseDate(since);
      if (sinceDate === "invalid") return fail("Invalid `since` date");
      const untilDate = parseDate(until);
      if (untilDate === "invalid") return fail("Invalid `until` date");

      const { items, nextCursor } = await listFeedback({
        project,
        form,
        platform,
        since: sinceDate,
        until: untilDate,
        limit,
        cursor,
      });
      return ok({ feedback: items, nextCursor });
    }
  );

  server.tool(
    "get_feedback",
    "Get a single feedback submission by id.",
    { id: z.string().describe('Feedback id, e.g. "fb_..."') },
    async ({ id }) => {
      const item = await getFeedbackById(id);
      if (!item) return fail(`No feedback found with id "${id}"`);
      return ok({ feedback: item });
    }
  );

  server.tool(
    "search_feedback",
    "Full-text search across a project's feedback data and metadata. Useful for finding submissions mentioning a keyword (e.g. \"crash\", \"pricing\", a feature name).",
    {
      project: projectArg,
      query: z.string().min(1).describe("Text to search for"),
      form: z.string().optional().describe("Filter to one form slug"),
      platform: z.string().optional().describe("Filter by platform"),
      limit: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
    },
    async ({ project, query, form, platform, limit }) => {
      const foundProject = getProject(project);
      if (!foundProject) return fail(`Unknown project "${project}"`);
      const items = await searchFeedback({ project, query, form, platform, limit });
      return ok({ feedback: items, count: items.length });
    }
  );

  server.tool(
    "feedback_stats",
    "Aggregate feedback counts for a project grouped by platform, form, or day. Use this to understand volume and trends before reading individual submissions.",
    {
      project: projectArg,
      groupBy: z.enum(["platform", "form", "day"]).describe("How to bucket the counts"),
      form: z.string().optional().describe("Filter to one form slug"),
      platform: z.string().optional().describe("Filter by platform"),
      ...dateArgs,
    },
    async ({ project, groupBy, form, platform, since, until }) => {
      const foundProject = getProject(project);
      if (!foundProject) return fail(`Unknown project "${project}"`);

      const sinceDate = parseDate(since);
      if (sinceDate === "invalid") return fail("Invalid `since` date");
      const untilDate = parseDate(until);
      if (untilDate === "invalid") return fail("Invalid `until` date");

      const stats = await feedbackStats({
        project,
        groupBy,
        form,
        platform,
        since: sinceDate,
        until: untilDate,
      });
      return ok(stats);
    }
  );

  return server;
}
