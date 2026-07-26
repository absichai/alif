import { NextResponse } from "next/server";
import { z } from "zod";

import { extractRelocationProfile } from "@/features/profile/profile-extractor";
import { OpenAIProfileModel } from "@/features/profile/openai-profile-model";
import { profileDraftSchema } from "@/features/profile/profile-schema";
import { getServerEnvironment } from "@/lib/env";
import { apiError } from "@/lib/http-errors";
import { incrementRateLimit } from "@/lib/neon-rate-limit";
import {
  FixedWindowRateLimiter,
  hashRateLimitKey,
} from "@/lib/rate-limit";

const requestSchema = z.object({
  story: z.string().trim().min(20).max(5_000),
  existingProfile: profileDraftSchema.nullable().optional(),
  answer: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }

  const body = requestSchema.safeParse(payload);
  if (!body.success) {
    return apiError(400, "INVALID_ONBOARDING", "Please add a little more detail.");
  }

  try {
    const { RATE_LIMIT_SALT } = getServerEnvironment();
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
    const clientAddress = forwardedFor.split(",")[0]?.trim() ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const limiter = new FixedWindowRateLimiter({
      limit: 10,
      windowMs: 10 * 60 * 1_000,
      increment: incrementRateLimit,
    });
    const limit = await limiter.check(
      hashRateLimitKey(`${clientAddress}:${userAgent}`, RATE_LIMIT_SALT),
    );
    if (!limit.allowed) {
      const response = apiError(
        429,
        "RATE_LIMITED",
        "Please wait before asking ALIF to read another story.",
        true,
      );
      response.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((limit.resetAt.getTime() - Date.now()) / 1_000))),
      );
      return response;
    }

    const result = await extractRelocationProfile(
      new OpenAIProfileModel(),
      body.data,
    );
    return NextResponse.json(result);
  } catch {
    return apiError(
      503,
      "PROFILE_EXTRACTION_UNAVAILABLE",
      "ALIF could not understand that yet. Your story is still here—please try again.",
      true,
    );
  }
}
