import { describe, expect, it } from "vitest";

import { FixedWindowRateLimiter } from "./rate-limit";

describe("FixedWindowRateLimiter", () => {
  it("allows the configured count and rejects the next request", async () => {
    const limiter = new FixedWindowRateLimiter({
      limit: 2,
      windowMs: 60_000,
      increment: async () => 1,
    });
    const first = await limiter.check("anonymous-a");
    expect(first.allowed).toBe(true);

    let count = 1;
    const countingLimiter = new FixedWindowRateLimiter({
      limit: 2,
      windowMs: 60_000,
      increment: async () => ++count,
    });
    expect((await countingLimiter.check("anonymous-a")).allowed).toBe(true);
    expect((await countingLimiter.check("anonymous-a")).allowed).toBe(false);
  });
});
