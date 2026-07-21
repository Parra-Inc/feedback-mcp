// Rewrites the datasource provider in prisma/schema/schema.prisma based on
// DATABASE_PROVIDER. Prisma requires a literal provider in the schema file,
// so this runs before every generate / db push / migrate (wired into the
// package.json db:* and build scripts).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raw = (process.env.DATABASE_PROVIDER || "postgresql").toLowerCase();
const provider = raw === "postgres" ? "postgresql" : raw;

if (provider === "mongodb") {
  console.error(
    "[prisma] MongoDB is not supported yet: Prisma 7 requires driver adapters and none exists for MongoDB. Use \"postgresql\", \"sqlite\", or \"d1\"."
  );
  process.exit(1);
}

if (provider !== "postgresql" && provider !== "sqlite" && provider !== "d1") {
  console.error(
    `[prisma] Unsupported DATABASE_PROVIDER "${raw}". Use "postgresql", "sqlite", or "d1".`
  );
  process.exit(1);
}

// D1 is SQLite under the hood, so it uses the "sqlite" schema dialect. The
// runtime adapter (@prisma/adapter-d1) is selected separately in the client.
const dialect = provider === "d1" ? "sqlite" : provider;

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(here, "..", "prisma", "schema", "schema.prisma");

const current = readFileSync(schemaPath, "utf8");
const next = current.replace(
  /provider = "(postgresql|sqlite)"/,
  `provider = "${dialect}"`
);

if (next !== current) {
  writeFileSync(schemaPath, next);
  console.log(`[prisma] datasource provider set to "${dialect}" (DATABASE_PROVIDER=${provider})`);
} else {
  console.log(`[prisma] datasource provider already "${dialect}"`);
}
