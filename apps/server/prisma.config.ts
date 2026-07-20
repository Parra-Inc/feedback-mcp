import "dotenv/config";
import path from "node:path";
import type { PrismaConfig } from "prisma";

const raw = (process.env.DATABASE_PROVIDER || "postgresql").toLowerCase();
const provider = raw === "postgres" ? "postgresql" : raw;

const defaultUrls: Record<string, string> = {
  postgresql: "postgresql://feedback:feedback@localhost:5452/feedback",
  sqlite: `file:${path.join(process.cwd(), "data", "feedback.db")}`,
};

export default {
  schema: "prisma/schema",
  datasource: {
    url: process.env.DATABASE_URL || defaultUrls[provider] || defaultUrls.postgresql,
  },
  // Migration history is maintained for PostgreSQL (the production default).
  // SQLite deployments use `prisma db push`; see docker-entrypoint.sh.
  migrations: {
    path: "prisma/migrations",
  },
} satisfies PrismaConfig;
