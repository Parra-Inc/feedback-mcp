import { prisma } from "@/lib/prisma/client";
import { getDatabaseProvider } from "@/lib/env";
import { parseJson } from "@/lib/json";

export interface FeedbackItem {
  id: string;
  projectSlug: string;
  formSlug: string;
  platform: string | null;
  data: unknown;
  metadata: unknown;
  userId: string | null;
  createdAt: Date;
}

interface FeedbackRow {
  id: string;
  projectSlug: string;
  formSlug: string;
  platform: string | null;
  data: string;
  metadata: string | null;
  userId: string | null;
  createdAt: Date;
}

export function serializeFeedback(row: FeedbackRow): FeedbackItem {
  return {
    id: row.id,
    projectSlug: row.projectSlug,
    formSlug: row.formSlug,
    platform: row.platform,
    data: parseJson(row.data),
    metadata: row.metadata ? parseJson(row.metadata) : null,
    userId: row.userId,
    createdAt: row.createdAt,
  };
}

export const MAX_PAGE_SIZE = 200;
export const DEFAULT_PAGE_SIZE = 50;

export interface ListFeedbackParams {
  project: string;
  form?: string;
  platform?: string;
  since?: Date;
  until?: Date;
  limit?: number;
  cursor?: string;
}

function buildWhere(params: {
  project: string;
  form?: string;
  platform?: string;
  since?: Date;
  until?: Date;
}) {
  return {
    projectSlug: params.project,
    ...(params.form ? { formSlug: params.form } : {}),
    ...(params.platform ? { platform: params.platform } : {}),
    ...(params.since || params.until
      ? {
          createdAt: {
            ...(params.since ? { gte: params.since } : {}),
            ...(params.until ? { lte: params.until } : {}),
          },
        }
      : {}),
  };
}

export async function listFeedback(
  params: ListFeedbackParams
): Promise<{ items: FeedbackItem[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const rows = await prisma.feedback.findMany({
    where: buildWhere(params),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(serializeFeedback);
  return {
    items,
    nextCursor: hasMore && items.length > 0 ? items[items.length - 1].id : null,
  };
}

export async function getFeedbackById(id: string): Promise<FeedbackItem | null> {
  const row = await prisma.feedback.findUnique({ where: { id } });
  return row ? serializeFeedback(row) : null;
}

export async function searchFeedback(params: {
  project: string;
  query: string;
  form?: string;
  platform?: string;
  limit?: number;
}): Promise<FeedbackItem[]> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  // `mode: "insensitive"` only exists in the PostgreSQL client; SQLite's LIKE
  // is already case-insensitive for ASCII. Spread keeps both clients happy.
  const insensitive =
    getDatabaseProvider() === "postgresql" ? { mode: "insensitive" as const } : {};

  const rows = await prisma.feedback.findMany({
    where: {
      ...buildWhere(params),
      OR: [
        { data: { contains: params.query, ...insensitive } },
        { metadata: { contains: params.query, ...insensitive } },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  return rows.map(serializeFeedback);
}

export type StatsGroupBy = "platform" | "form" | "day";

export interface FeedbackStats {
  total: number;
  groupBy: StatsGroupBy;
  groups: { key: string; count: number }[];
}

export async function feedbackStats(params: {
  project: string;
  form?: string;
  platform?: string;
  groupBy: StatsGroupBy;
  since?: Date;
  until?: Date;
}): Promise<FeedbackStats> {
  const where = buildWhere(params);
  const total = await prisma.feedback.count({ where });

  if (params.groupBy === "day") {
    // Bucketing by day in JS keeps this portable across providers. Capped at
    // 50k rows, which is plenty for a self-hosted feedback store.
    const rows = await prisma.feedback.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 50_000,
    });
    const buckets = new Map<string, number>();
    for (const row of rows) {
      const day = row.createdAt.toISOString().slice(0, 10);
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return {
      total,
      groupBy: "day",
      groups: [...buckets.entries()].map(([key, count]) => ({ key, count })),
    };
  }

  const by = params.groupBy === "platform" ? ("platform" as const) : ("formSlug" as const);
  const grouped = await prisma.feedback.groupBy({
    by: [by],
    where,
    _count: { _all: true },
  });

  return {
    total,
    groupBy: params.groupBy,
    groups: grouped
      .map((group) => ({
        key: (group[by] as string | null) ?? "(none)",
        count: group._count._all,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
