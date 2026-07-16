// Minimal status page for a running instance. The marketing site lives in
// apps/site; this page just confirms the server is up and points at the docs.
export default function Home() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "96px 24px",
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
      <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Feedback MCP</h1>
      <p style={{ color: "#9aa4b2", margin: "0 0 32px" }}>
        This instance is running. Feedback is collected at{" "}
        <code style={{ color: "#7dd3fc" }}>POST /api/v1/feedback</code> and served to
        MCP clients at <code style={{ color: "#7dd3fc" }}>/api/mcp</code>.
      </p>
      <ul style={{ color: "#9aa4b2", paddingLeft: 20 }}>
        <li>
          <a href="/api/health" style={{ color: "#7dd3fc" }}>
            Health check
          </a>
        </li>
        <li>
          <a
            href="https://github.com/Parra-Inc/feedback-mcp"
            style={{ color: "#7dd3fc" }}
          >
            Documentation on GitHub
          </a>
        </li>
      </ul>
    </main>
  );
}
