import { createHmac } from "node:crypto";

type Increment = (
  keyHash: string,
  windowStartedAt: Date,
  expiresAt: Date,
) => Promise<number>;

export class FixedWindowRateLimiter {
  constructor(
    private readonly options: {
      limit: number;
      windowMs: number;
      increment: Increment;
    },
  ) {}

  async check(rawKey: string) {
    const now = Date.now();
    const windowStartMs =
      Math.floor(now / this.options.windowMs) * this.options.windowMs;
    const windowStartedAt = new Date(windowStartMs);
    const expiresAt = new Date(windowStartMs + this.options.windowMs * 2);
    const count = await this.options.increment(
      rawKey,
      windowStartedAt,
      expiresAt,
    );
    return {
      allowed: count <= this.options.limit,
      remaining: Math.max(0, this.options.limit - count),
      resetAt: new Date(windowStartMs + this.options.windowMs),
    };
  }
}

export function hashRateLimitKey(value: string, salt: string): string {
  return createHmac("sha256", salt).update(value).digest("hex");
}
