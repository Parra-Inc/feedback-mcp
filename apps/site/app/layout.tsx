import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FAQ } from "@/lib/faq";
import { GITHUB_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME}: Open-Source, Self-Hosted Feedback Collection for MCP`,
  description: SITE_DESCRIPTION,
  keywords: [
    "feedback mcp",
    "mcp feedback server",
    "feedback mcp server",
    "model context protocol feedback",
    "self-hosted feedback tool",
    "open source feedback api",
    "collect user feedback",
    "analyze feedback with claude",
    "feedback form api",
    "user feedback mcp tool",
    "mcp server for feedback",
    "self hosted feedback collection",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME}: Open-Source, Self-Hosted Feedback Collection for MCP`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: Open-Source, Self-Hosted Feedback Collection for MCP`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Self-hosted (Docker, Node.js)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    license: "https://opensource.org/license/mit",
    sameAs: [GITHUB_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
