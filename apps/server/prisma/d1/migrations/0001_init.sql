-- Cloudflare D1 (SQLite) schema for Feedback MCP.
-- Applied with `wrangler d1 migrations apply` (see wrangler.jsonc migrations_dir).
-- This mirrors the Prisma schema (prisma/schema) in the SQLite dialect; the
-- Postgres deployment uses prisma/migrations instead.

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectSlug" TEXT NOT NULL,
    "formSlug" TEXT NOT NULL,
    "platform" TEXT,
    "data" TEXT NOT NULL,
    "metadata" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Feedback_projectSlug_formSlug_createdAt_idx" ON "Feedback"("projectSlug", "formSlug", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_projectSlug_platform_idx" ON "Feedback"("projectSlug", "platform");
