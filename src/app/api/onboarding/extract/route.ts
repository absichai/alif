import { NextResponse } from "next/server";
import { z } from "zod";

import { extractRelocationProfile } from "@/features/profile/profile-extractor";
import { OpenAIProfileModel } from "@/features/profile/openai-profile-model";
import { profileDraftSchema } from "@/features/profile/profile-schema";
import { apiError } from "@/lib/http-errors";

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
