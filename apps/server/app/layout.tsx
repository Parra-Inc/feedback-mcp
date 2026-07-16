import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Feedback MCP",
  description:
    "Self-hosted feedback collection with a built-in MCP server. This is a Feedback MCP instance.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: "#0b0e14",
          color: "#e6e9ef",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
