// data/metadata are stored as JSON strings so a single Prisma schema stays
// portable across PostgreSQL, SQLite, and MongoDB. These helpers centralize
// the (de)serialization.

export function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}

export function parseJson(value: string | null): unknown {
  if (value === null) return null;
  try {
    return JSON.parse(value);
  } catch {
    // Should never happen for rows we wrote, but never let a corrupt row
    // take down a list endpoint.
    return null;
  }
}
