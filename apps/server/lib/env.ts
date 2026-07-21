import path from "node:path";

// "d1" is Cloudflare D1, which speaks the SQLite dialect but is reached through
// a Workers binding instead of a file. For everything schema-related it behaves
// like "sqlite" (see prepare-prisma.mjs); only the runtime adapter differs.
export type DatabaseProvider = "postgresql" | "sqlite" | "d1";

export function getDatabaseProvider(): DatabaseProvider {
  const raw = (process.env.DATABASE_PROVIDER || "postgresql").toLowerCase();
  const provider = raw === "postgres" ? "postgresql" : raw;
  if (provider === "mongodb") {
    throw new Error(
      'MongoDB is not supported yet: Prisma 7 requires driver adapters and none exists for MongoDB. Use "postgresql", "sqlite", or "d1".'
    );
  }
  if (provider !== "postgresql" && provider !== "sqlite" && provider !== "d1") {
    throw new Error(
      `Unsupported DATABASE_PROVIDER "${raw}". Use "postgresql", "sqlite", or "d1".`
    );
  }
  return provider;
}

// The SQL dialect Prisma should generate for this provider. D1 collapses to
// "sqlite" because it is SQLite under the hood.
export function getSchemaDialect(): "postgresql" | "sqlite" {
  return getDatabaseProvider() === "postgresql" ? "postgresql" : "sqlite";
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  switch (getDatabaseProvider()) {
    case "d1":
      // D1 is a binding, not a URL. Callers on the D1 path never read this.
      throw new Error(
        "DATABASE_PROVIDER=d1 uses a Cloudflare D1 binding, not DATABASE_URL."
      );
    case "sqlite":
      return `file:${path.join(process.cwd(), "data", "feedback.db")}`;
    case "postgresql":
    default:
      return "postgresql://feedback:feedback@localhost:5452/feedback";
  }
}
