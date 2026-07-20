import path from "node:path";

export type DatabaseProvider = "postgresql" | "sqlite";

export function getDatabaseProvider(): DatabaseProvider {
  const raw = (process.env.DATABASE_PROVIDER || "postgresql").toLowerCase();
  const provider = raw === "postgres" ? "postgresql" : raw;
  if (provider === "mongodb") {
    throw new Error(
      'MongoDB is not supported yet: Prisma 7 requires driver adapters and none exists for MongoDB. Use "postgresql" or "sqlite".'
    );
  }
  if (provider !== "postgresql" && provider !== "sqlite") {
    throw new Error(
      `Unsupported DATABASE_PROVIDER "${raw}". Use "postgresql" or "sqlite".`
    );
  }
  return provider;
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  switch (getDatabaseProvider()) {
    case "sqlite":
      return `file:${path.join(process.cwd(), "data", "feedback.db")}`;
    case "postgresql":
    default:
      return "postgresql://feedback:feedback@localhost:5452/feedback";
  }
}
