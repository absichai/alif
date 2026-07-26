import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnvironment } from "@/lib/env";

import * as schema from "./schema";

type Database = ReturnType<typeof createDb>;

function createDb() {
  const { DATABASE_URL } = getServerEnvironment();
  return drizzle(neon(DATABASE_URL), { schema });
}

let cached: Database | null = null;

export function getDb(): Database {
  cached ??= createDb();
  return cached;
}
