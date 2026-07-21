import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnvironment } from "@/lib/env";

import * as schema from "./schema";

export function getDb() {
  const { DATABASE_URL } = getServerEnvironment();
  return drizzle(neon(DATABASE_URL), { schema });
}
