import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { getDatabaseProvider, getDatabaseUrl } from "@/lib/env";
import { createId, getModelPrefix } from "@/lib/id";

// IDs are generated in the app layer (fb_...) instead of with a database
// default so the same code works on PostgreSQL, SQLite, and MongoDB.
function createExtendedClient(base: PrismaClient) {
  return base.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const prefix = getModelPrefix(model);
          if (prefix && !(args.data as Record<string, unknown>).id) {
            (args.data as Record<string, unknown>).id = createId(prefix);
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          const prefix = getModelPrefix(model);
          if (prefix) {
            const items = Array.isArray(args.data) ? args.data : [args.data];
            for (const item of items) {
              if (!(item as Record<string, unknown>).id) {
                (item as Record<string, unknown>).id = createId(prefix);
              }
            }
          }
          return query(args);
        },
        async upsert({ model, args, query }) {
          const prefix = getModelPrefix(model);
          if (prefix && !(args.create as Record<string, unknown>).id) {
            (args.create as Record<string, unknown>).id = createId(prefix);
          }
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

function createBaseClient(): PrismaClient {
  const provider = getDatabaseProvider();
  const url = getDatabaseUrl();

  if (provider === "sqlite") {
    const filePath = url.startsWith("file:") ? url.slice(5) : url;
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: `file:${absolutePath}` }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  const isLocalhost = /localhost|127\.0\.0\.1/.test(url);
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url,
      ssl: isLocalhost ? false : { rejectUnauthorized: true },
      idleTimeoutMillis: 5000,
      min: 1,
    }),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createExtendedClient(createBaseClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
