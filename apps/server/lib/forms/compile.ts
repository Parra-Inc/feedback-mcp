import { z } from "zod";
import type { FieldConfig, FormConfig } from "@/lib/config/schema";

function compileField(field: FieldConfig): z.ZodType {
  let schema: z.ZodType;

  switch (field.type) {
    case "string": {
      let s = z.string();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      if (field.pattern) s = s.regex(new RegExp(field.pattern));
      schema = s;
      break;
    }
    case "number": {
      let s = z.number();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      schema = s;
      break;
    }
    case "boolean":
      schema = z.boolean();
      break;
    case "email":
      schema = z.email();
      break;
    case "url":
      schema = z.url();
      break;
    case "date":
      // Accepts "2026-07-16" or a full ISO timestamp.
      schema = z.union([z.iso.datetime({ offset: true }), z.iso.date()]);
      break;
    case "enum":
      // values is guaranteed non-empty by the config meta-schema.
      schema = z.enum(field.values as [string, ...string[]]);
      break;
  }

  return field.required ? schema : schema.optional();
}

// Turns a form's declarative field spec into a Zod object schema. Unknown
// keys are rejected so submissions must match the form exactly.
export function compileFormSchema(form: FormConfig) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of form.fields) {
    shape[field.name] = compileField(field);
  }
  return z.strictObject(shape);
}
