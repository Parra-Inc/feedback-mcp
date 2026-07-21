import { afterEach, describe, expect, it } from "vitest";
import { getDatabaseProvider, getDatabaseUrl, getSchemaDialect } from "@/lib/env";

afterEach(() => {
  delete process.env.DATABASE_PROVIDER;
  delete process.env.DATABASE_URL;
});

describe("getDatabaseProvider", () => {
  it("defaults to postgresql", () => {
    expect(getDatabaseProvider()).toBe("postgresql");
  });

  it("normalizes postgres to postgresql", () => {
    process.env.DATABASE_PROVIDER = "postgres";
    expect(getDatabaseProvider()).toBe("postgresql");
  });

  it("accepts sqlite and d1", () => {
    process.env.DATABASE_PROVIDER = "sqlite";
    expect(getDatabaseProvider()).toBe("sqlite");
    process.env.DATABASE_PROVIDER = "d1";
    expect(getDatabaseProvider()).toBe("d1");
  });

  it("rejects unknown providers and points at mongodb's status", () => {
    process.env.DATABASE_PROVIDER = "mysql";
    expect(() => getDatabaseProvider()).toThrow(/Unsupported DATABASE_PROVIDER/);
    process.env.DATABASE_PROVIDER = "mongodb";
    expect(() => getDatabaseProvider()).toThrow(/MongoDB is not supported/);
  });
});

describe("getSchemaDialect", () => {
  it("collapses d1 to the sqlite dialect", () => {
    process.env.DATABASE_PROVIDER = "d1";
    expect(getSchemaDialect()).toBe("sqlite");
  });

  it("keeps postgresql and sqlite as-is", () => {
    process.env.DATABASE_PROVIDER = "postgresql";
    expect(getSchemaDialect()).toBe("postgresql");
    process.env.DATABASE_PROVIDER = "sqlite";
    expect(getSchemaDialect()).toBe("sqlite");
  });
});

describe("getDatabaseUrl", () => {
  it("throws for d1 (it uses a binding, not a URL)", () => {
    process.env.DATABASE_PROVIDER = "d1";
    expect(() => getDatabaseUrl()).toThrow(/D1 binding/);
  });

  it("returns an explicit DATABASE_URL when set", () => {
    process.env.DATABASE_PROVIDER = "postgresql";
    process.env.DATABASE_URL = "postgresql://x/y";
    expect(getDatabaseUrl()).toBe("postgresql://x/y");
  });
});
