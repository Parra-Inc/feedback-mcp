import { FAQ } from "@/lib/faq";
import { GITHUB_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitHubIcon } from "@/components/ui/icons";

const FEATURES = [
  {
    title: "One endpoint for all feedback",
    body: "Apps POST to /api/v1/feedback with an ingest key. iOS, Android, web, desktop, or server: if it can make an HTTP request, it can send feedback.",
  },
  {
    title: "Built-in MCP server",
    body: "Connect Claude Code, Claude Desktop, or any MCP client to /api/mcp and query your feedback with tools like list_feedback, search_feedback, and feedback_stats.",
  },
  {
    title: "Forms as config, not code",
    body: "Define projects and forms as JSON files in a config folder. Each form declares a field schema that submissions are validated against with Zod. Easy for humans, trivial for LLMs.",
  },
  {
    title: "PostgreSQL or SQLite",
    body: "Pick your database with one env var. SQLite means a single container with zero external dependencies; PostgreSQL is the production default.",
  },
  {
    title: "Slack cross-posting",
    body: "Set a webhook URL and every submission is posted to Slack right after it hits the database, globally or per project. Your team sees feedback in real time.",
  },
  {
    title: "Three-layer auth",
    body: "Public ingest keys for submitting, an MCP secret for reading and analysis, and optional end-user JWT verification (JWKS, PEM, or HMAC) to attach verified user identities to feedback.",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Define your forms",
    body: "Add a project folder with JSON form definitions to config/projects. Deploy with Docker, Railway, Render, or Vercel.",
    code: `config/projects/my-app/
  project.json
  forms/
    bug-report.json
    feature-request.json`,
  },
  {
    step: "2",
    title: "Send feedback from your app",
    body: "POST submissions with your ingest key. Data is validated against the form schema and stored with platform and metadata.",
    code: `POST /api/v1/feedback
X-Feedback-Key: <ingest key>

{
  "project": "my-app",
  "form": "bug-report",
  "platform": "ios",
  "data": {
    "title": "Crash on launch",
    "severity": "high"
  }
}`,
  },
  {
    step: "3",
    title: "Analyze it with Claude",
    body: "Connect any MCP client to your instance and ask real questions about your feedback: trends, summaries, themes, and specific reports.",
    code: `> Summarize this week's bug
  reports for my-app

> What features are users
  requesting most on iOS?`,
  },
] as const;

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <span aria-hidden>💬</span>
          <span>Feedback MCP</span>
        </div>
        <Button href={GITHUB_URL} variant="ghost" size="sm">
          <GitHubIcon />
          GitHub
        </Button>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center">
        <p className="mx-auto mb-6 w-fit rounded-full border border-line bg-panel px-4 py-1 text-xs font-medium tracking-wide text-accent">
          Free • Open source • MIT licensed • Self-hosted
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          The open-source{" "}
          <span className="rounded-xl bg-accent/15 px-2 text-accent">feedback MCP</span>{" "}
          server
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted">
          Collect user feedback from any app through one API endpoint. Analyze it with
          Claude through the Model Context Protocol. No dashboard, no SaaS, no lock-in:
          your feedback in your database.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button href={GITHUB_URL}>Get started on GitHub</Button>
          <Button href="#how-it-works" variant="secondary">
            How it works
          </Button>
        </div>
        <Card className="mx-auto mt-12 max-w-2xl overflow-x-auto text-left">
          <pre className="text-sm leading-relaxed text-sky">
            <code>{`git clone ${GITHUB_URL}.git
cd feedback-mcp
cp apps/server/.env.example .env   # set MCP_SECRET + ingest keys
docker compose up -d               # SQLite, zero dependencies`}</code>
          </pre>
        </Card>
      </section>

      {/* What is a feedback MCP */}
      <section className="border-y border-line bg-panel/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">What is a feedback MCP server?</h2>
          <div className="mt-6 grid gap-6 text-muted sm:grid-cols-2">
            <p>
              A feedback MCP server is a feedback collection tool that speaks the{" "}
              <a
                className="text-sky underline-offset-4 hover:underline"
                href="https://modelcontextprotocol.io"
              >
                Model Context Protocol
              </a>
              . Your apps submit feedback (bug reports, feature requests, NPS, anything
              you define) to a single self-hosted endpoint. Your AI assistant then
              connects to the same server as an MCP client and works with that feedback
              directly: listing, searching, aggregating, and summarizing it on demand.
            </p>
            <p>
              That flips the usual model. Instead of building dashboards and reading
              through submissions one by one, you ask questions in plain language and
              let the model do the reading. Feedback MCP keeps the pipeline minimal:
              declarative form schemas, one ingest endpoint, a small read API, an MCP
              server, and optional Slack cross-posting. Everything runs on your
              infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.step}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {step.step}
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-3 text-xs leading-relaxed text-sky">
                <code>{step.code}</code>
              </pre>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-panel/50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MCP connect */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your AI assistant is the dashboard
            </h2>
            <p className="mt-4 text-muted">
              Add your instance to Claude Code or any MCP client with a single secret.
              The server exposes read and analysis tools over streamable HTTP, so
              &ldquo;check the feedback&rdquo; becomes a conversation, not a chore.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {[
                "list_projects / list_forms: see what's configured",
                "list_feedback / get_feedback: read submissions with filters",
                "search_feedback: full-text search across data and metadata",
                "feedback_stats: counts by platform, form, or day",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="overflow-x-auto">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              .mcp.json
            </p>
            <pre className="text-sm leading-relaxed text-sky">
              <code>{`{
  "mcpServers": {
    "feedback": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://feedback.your-domain.com/api/mcp",
        "--header",
        "Authorization: Bearer \${MCP_SECRET}"
      ]
    }
  }
}`}</code>
            </pre>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-line bg-panel/50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-line bg-panel p-6"
              >
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Own your feedback. Analyze it with AI.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Clone the repo, set two environment variables, and start collecting feedback
          in minutes.
        </p>
        <Button href={GITHUB_URL} size="lg" className="mt-8">
          View on GitHub
        </Button>
        <footer className="mt-16 border-t border-line pt-8 text-sm text-muted">
          <p>
            Feedback MCP is MIT licensed open source software by{" "}
            <a className="text-sky hover:underline" href="https://github.com/Parra-Inc">
              Parra
            </a>
            .
          </p>
        </footer>
      </section>
    </main>
  );
}
