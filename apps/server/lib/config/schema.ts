import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9][a-z0-9-]*$/,
    "Slugs must be lowercase alphanumeric with dashes (e.g. my-app)"
  );

export const fieldSchema = z
  .strictObject({
    name: z
      .string()
      .regex(
        /^[a-zA-Z][a-zA-Z0-9_]*$/,
        "Field names must start with a letter and contain only letters, numbers, and underscores"
      ),
    type: z.enum(["string", "number", "boolean", "enum", "email", "url", "date"]),
    label: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    values: z.array(z.string()).min(1).optional(),
  })
  .refine((field) => field.type !== "enum" || (field.values && field.values.length > 0), {
    message: 'Fields with type "enum" must define "values"',
  });

export const formConfigSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
});

export const jwtConfigSchema = z
  .strictObject({
    issuer: z.string().optional(),
    audience: z.string().optional(),
    algorithms: z.array(z.string()).optional(),
    // Exactly one verification source:
    jwksUrl: z.url().optional(), // remote JWKS (e.g. Auth0, Clerk, your own)
    publicKeyEnv: z.string().optional(), // env var holding a PEM (SPKI) public key
    secretEnv: z.string().optional(), // env var holding a shared HMAC secret
    required: z.boolean().default(false),
  })
  .refine(
    (jwt) => [jwt.jwksUrl, jwt.publicKeyEnv, jwt.secretEnv].filter(Boolean).length === 1,
    { message: 'JWT config must define exactly one of "jwksUrl", "publicKeyEnv", or "secretEnv"' }
  );

export const projectConfigSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  platforms: z.array(z.string().min(1)).optional(),
  ingestKeys: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        secretEnv: z.string().min(1),
      })
    )
    .min(1),
  auth: z
    .strictObject({
      jwt: jwtConfigSchema.optional(),
    })
    .optional(),
  slackWebhookEnv: z.string().optional(),
});

export type FieldConfig = z.infer<typeof fieldSchema>;
export type FormConfig = z.infer<typeof formConfigSchema>;
export type JwtConfig = z.infer<typeof jwtConfigSchema>;
export type ProjectConfig = z.infer<typeof projectConfigSchema>;
