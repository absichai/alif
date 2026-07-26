import "server-only";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { getServerEnvironment } from "@/lib/env";

import * as schema from "./schema";

// The neon-http driver has no transaction support, and every ALIF write path
// (journey creation, step completion, profile regeneration, proposal
// confirmation) runs inside db.transaction(). The WebSocket driver supports
// interactive transactions; Node 22+ provides a global WebSocket.
if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

type Database = ReturnType<typeof createDb>;

function createDb() {
  const { DATABASE_URL } = getServerEnvironment();
  return drizzle(new Pool({ connectionString: DATABASE_URL }), { schema });
}

let cached: Database | null = null;

export function getDb(): Database {
  cached ??= createDb();
  return cached;
}
