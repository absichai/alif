import "server-only";

import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

export async function incrementRateLimit(
  keyHash: string,
  windowStartedAt: Date,
  expiresAt: Date,
): Promise<number> {
  const result = await getDb().execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key_hash, window_started_at, count, expires_at)
    VALUES (${keyHash}, ${windowStartedAt}, 1, ${expiresAt})
    ON CONFLICT (key_hash) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_started_at < EXCLUDED.window_started_at THEN 1
        ELSE rate_limits.count + 1
      END,
      window_started_at = CASE
        WHEN rate_limits.window_started_at < EXCLUDED.window_started_at
        THEN EXCLUDED.window_started_at
        ELSE rate_limits.window_started_at
      END,
      expires_at = EXCLUDED.expires_at
    RETURNING count
  `);
  return Number(result.rows[0]?.count ?? 1);
}
