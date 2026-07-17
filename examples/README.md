# Client examples

Minimal, dependency-free snippets for submitting feedback to a Feedback MCP instance. Copy them into your app and adjust the endpoint, project, and form slugs.

| File | For |
|---|---|
| [`typescript/feedback-client.ts`](typescript/feedback-client.ts) | Web, Node.js, React Native (anything with `fetch`) |
| [`swift/FeedbackClient.swift`](swift/FeedbackClient.swift) | iOS, iPadOS, macOS (SwiftUI or UIKit) |

Both send the same request:

```
POST /api/v1/feedback
Content-Type: application/json
X-Feedback-Key: <your project's ingest key>
Authorization: Bearer <optional end-user JWT>

{ "project": "...", "form": "...", "platform": "...", "data": { ... }, "metadata": { ... } }
```

The ingest key is a spam deterrent, not a secret: it only allows submitting feedback to one project. Keep the MCP secret out of client apps entirely.
