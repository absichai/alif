import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-5.6-terra"),
  DATABASE_URL: z.string().url(),
  RATE_LIMIT_SALT: z.string().min(32),
});

type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cached: ServerEnvironment | null = null;

export function getServerEnvironment(): ServerEnvironment {
  cached ??= serverEnvironmentSchema.parse(process.env);
  return cached;
}
