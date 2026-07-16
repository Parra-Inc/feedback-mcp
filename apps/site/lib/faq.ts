// Shared between the visible FAQ section and the FAQPage JSON-LD so the
// structured data always matches the on-page content.
export const FAQ = [
  {
    question: "What is a feedback MCP server?",
    answer:
      "A feedback MCP server collects user feedback from your apps and exposes it to AI assistants through the Model Context Protocol (MCP). Instead of reading feedback in a dashboard, you connect Claude (or any MCP client) to your server and ask questions like \"summarize this week's bug reports\" or \"what are users asking for most?\". Feedback MCP is an open-source implementation you host yourself.",
  },
  {
    question: "Is Feedback MCP free?",
    answer:
      "Yes. Feedback MCP is free, open source (MIT licensed), and self-hosted. There is no hosted tier, no usage limits, and no vendor lock-in: your feedback lives in your own PostgreSQL or SQLite database.",
  },
  {
    question: "How do I send feedback from my app?",
    answer:
      "Your app makes a single HTTP POST to /api/v1/feedback with a project ingest key, the form slug, the submission data, and optional metadata like app version or device. The server validates the data against the form's schema, stores it, and optionally cross-posts it to Slack. It works from iOS, Android, web, or any backend.",
  },
  {
    question: "How do I analyze feedback with Claude?",
    answer:
      "Add your server's /api/mcp endpoint to Claude Code, Claude Desktop, or any MCP client, authenticating with your MCP secret. The server exposes tools to list projects and forms, list and search feedback, and aggregate stats, so the AI can query, summarize, and analyze your real user feedback.",
  },
  {
    question: "Which databases are supported?",
    answer:
      "PostgreSQL and SQLite are supported out of the box, selected with a single DATABASE_PROVIDER environment variable. SQLite makes single-container self-hosting trivial; PostgreSQL is the default for production. MongoDB is on the roadmap.",
  },
  {
    question: "Do I need to build a dashboard?",
    answer:
      "No. Feedback MCP is intentionally dashboard-free: the read API and MCP tools are the interface. Your AI assistant becomes the dashboard, and a Slack webhook can give your team real-time visibility as feedback arrives.",
  },
] as const;
