import { FAQ } from "@/lib/faq";
import { GITHUB_URL } from "@/lib/site";

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

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <span aria-hidden>💬</span>
          <span>Feedback MCP</span>
        </div>
        <a
          href={GITHUB_URL}
          className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-fg"
        >
          <GitHubIcon />
          GitHub
        </a>
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
          <a
            href={GITHUB_URL}
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-ink transition hover:bg-accent-dim"
          >
            Get started on GitHub
          </a>
          <a
            href="#how-it-works"
            className="rounded-xl border border-line px-6 py-3 font-semibold text-fg transition hover:border-accent"
          >
            How it works
          </a>
        </div>
        <div className="mx-auto mt-12 max-w-2xl overflow-x-auto rounded-2xl border border-line bg-panel p-6 text-left">
          <pre className="text-sm leading-relaxed text-sky">
            <code>{`git clone ${GITHUB_URL}.git
cd feedback-mcp
cp apps/server/.env.example .env   # set MCP_SECRET + ingest keys
docker compose up -d               # SQLite, zero dependencies`}</code>
          </pre>
        </div>
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
            <div key={step.step} className="rounded-2xl border border-line bg-panel p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {step.step}
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-3 text-xs leading-relaxed text-sky">
                <code>{step.code}</code>
              </pre>
            </div>
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
              <div key={feature.title} className="rounded-2xl border border-line bg-panel p-6">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.body}</p>
              </div>
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
          <div className="overflow-x-auto rounded-2xl border border-line bg-panel p-6">
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
          </div>
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
        <a
          href={GITHUB_URL}
          className="mt-8 inline-block rounded-xl bg-accent px-8 py-3 font-semibold text-ink transition hover:bg-accent-dim"
        >
          View on GitHub
        </a>
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
