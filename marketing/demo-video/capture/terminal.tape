# VHS tape: a clean terminal recording of the ingest path.
# Install VHS once:  brew install vhs   (https://github.com/charmbracelet/vhs)
# Prereq: the local stack is running with a known ingest key, e.g. from the repo root:
#     MCP_SECRET=dev EXAMPLE_APP_INGEST_KEY=dev pnpm dev:server
# Then, from marketing/demo-video:
#     npm run capture:terminal
#
# Output is public/captures/terminal.mp4 and set-capture.mjs points captures.json at it.

Output public/captures/terminal.mp4

Require curl

Set Shell "bash"
Set FontFamily "JetBrains Mono"
Set FontSize 22
Set Width 1360
Set Height 766
Set Padding 44
Set Margin 0
Set BorderRadius 0
Set TypingSpeed 55ms
Set Theme { "name": "feedback-mcp", "background": "#0a1613", "foreground": "#e6f2ec", "cursor": "#34d399", "selection": "#123128", "black": "#06110d", "red": "#ff6b6b", "green": "#34d399", "yellow": "#f5c04e", "blue": "#7dd3fc", "magenta": "#86efac", "cyan": "#7dd3fc", "white": "#e6f2ec", "brightGreen": "#86efac", "brightBlue": "#7dd3fc" }

# Let the recording settle before typing.
Sleep 700ms

# Health check, prove the server is up.
Type `curl -s http://localhost:3065/api/health | jq`
Sleep 400ms
Enter
Sleep 1600ms

# Submit one piece of feedback to the real endpoint.
Type `curl -sS -X POST http://localhost:3065/api/v1/feedback \`
Enter
Type `  -H "X-Feedback-Key: $EXAMPLE_APP_INGEST_KEY" \`
Enter
Type `  -H "Content-Type: application/json" \`
Enter
Type `  -d '{"project":"example-app","form":"bug-report","platform":"ios","data":{"title":"Crash on launch","severity":"high"}}' | jq`
Sleep 500ms
Enter
Sleep 2600ms

# Hold on the 200 response.
Sleep 1400ms
