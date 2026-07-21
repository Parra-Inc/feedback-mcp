import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { getDatabaseProvider, getDatabaseUrl } from "@/lib/env";
import { createId, getModelPrefix } from "@/lib/id";
import { cfEnv } from "@/lib/cloudflare/context";

// IDs are generated in the app layer (fb_...) instead of with a database
// default so the same code works on PostgreSQL, SQLite, and Cloudflare D1.
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

  if (provider === "d1") {
    // Cloudflare D1: the database is a Workers binding (env.DB), resolved per
    // request through the OpenNext context.
    const env = cfEnv();
    if (!env?.DB) {
      throw new Error(
        "DATABASE_PROVIDER=d1 but no D1 binding named DB is available. This path only runs on Cloudflare Workers with a d1_databases binding in wrangler.jsonc."
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaD1 } = require("@prisma/adapter-d1");
    return new PrismaClient({ adapter: new PrismaD1(env.DB) });
  }

  if (provider === "sqlite") {
    const url = getDatabaseUrl();
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

  const url = getDatabaseUrl();
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

// The client is constructed lazily on first use, never at module scope. On
// Cloudflare Workers the D1 binding is only reachable inside a request (via
// getCloudflareContext), so eager construction would fail. The Proxy defers
// construction until the first property access, which always happens in a
// request handler.
function getClient(): ExtendedPrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createExtendedClient(createBaseClient());
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
