import { describe, expect, it } from "vitest";
import { compileFormSchema } from "@/lib/forms/compile";
import type { FormConfig } from "@/lib/config/schema";

function form(fields: FormConfig["fields"]): FormConfig {
  return { slug: "test", name: "Test", fields };
}

describe("compileFormSchema", () => {
  it("validates a complete submission", () => {
    const schema = compileFormSchema(
      form([
        { name: "title", type: "string", required: true, max: 10 },
        { name: "count", type: "number", min: 1, max: 5, required: false },
        { name: "urgent", type: "boolean", required: false },
      ])
    );
    const result = schema.safeParse({ title: "hello", count: 3, urgent: true });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const schema = compileFormSchema(form([{ name: "title", type: "string", required: true }]));
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("allows omitting optional fields", () => {
    const schema = compileFormSchema(
      form([
        { name: "title", type: "string", required: true },
        { name: "note", type: "string", required: false },
      ])
    );
    expect(schema.safeParse({ title: "x" }).success).toBe(true);
  });

  it("rejects unknown keys (strict)", () => {
    const schema = compileFormSchema(form([{ name: "title", type: "string", required: true }]));
    expect(schema.safeParse({ title: "x", extra: "nope" }).success).toBe(false);
  });

  it("enforces string min/max/pattern", () => {
    const schema = compileFormSchema(
      form([{ name: "code", type: "string", required: true, min: 2, max: 4, pattern: "^[a-z]+$" }])
    );
    expect(schema.safeParse({ code: "ab" }).success).toBe(true);
    expect(schema.safeParse({ code: "a" }).success).toBe(false);
    expect(schema.safeParse({ code: "abcde" }).success).toBe(false);
    expect(schema.safeParse({ code: "AB" }).success).toBe(false);
  });

  it("enforces number ranges", () => {
    const schema = compileFormSchema(
      form([{ name: "rating", type: "number", required: true, min: 1, max: 5 }])
    );
    expect(schema.safeParse({ rating: 5 }).success).toBe(true);
    expect(schema.safeParse({ rating: 0 }).success).toBe(false);
    expect(schema.safeParse({ rating: "5" }).success).toBe(false);
  });

  it("validates enum values", () => {
    const schema = compileFormSchema(
      form([{ name: "severity", type: "enum", required: true, values: ["low", "high"] }])
    );
    expect(schema.safeParse({ severity: "low" }).success).toBe(true);
    expect(schema.safeParse({ severity: "medium" }).success).toBe(false);
  });

  it("validates email and url", () => {
    const schema = compileFormSchema(
      form([
        { name: "email", type: "email", required: true },
        { name: "link", type: "url", required: true },
      ])
    );
    expect(schema.safeParse({ email: "a@b.co", link: "https://x.dev" }).success).toBe(true);
    expect(schema.safeParse({ email: "nope", link: "https://x.dev" }).success).toBe(false);
    expect(schema.safeParse({ email: "a@b.co", link: "not-a-url" }).success).toBe(false);
  });

  it("accepts ISO dates and datetimes for date fields", () => {
    const schema = compileFormSchema(form([{ name: "when", type: "date", required: true }]));
    expect(schema.safeParse({ when: "2026-07-16" }).success).toBe(true);
    expect(schema.safeParse({ when: "2026-07-16T12:30:00Z" }).success).toBe(true);
    expect(schema.safeParse({ when: "July 16" }).success).toBe(false);
  });
});
