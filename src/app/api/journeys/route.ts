import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import { createJourney, getJourney } from "@/features/journey/journey-service";
import {
  finalizeProfile,
  profileDraftSchema,
} from "@/features/profile/profile-schema";
import { apiError } from "@/lib/http-errors";

const repository = new NeonJourneyRepository();

export async function GET() {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");
  const result = await getJourney(repository, userId, dubaiPack);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  const existing = await getJourney(repository, userId, dubaiPack);
  if (existing) return NextResponse.json(existing);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }

  const draft = profileDraftSchema.safeParse(payload);
  if (!draft.success) {
    return apiError(400, "INVALID_PROFILE", "Your relocation profile is incomplete.");
  }
  const profile = finalizeProfile(draft.data);
  if (!profile.success) {
    return apiError(
      400,
      "INCOMPLETE_PROFILE",
      "Please complete the required questions.",
    );
  }

  const result = await createJourney(repository, userId, profile.data, dubaiPack);
  return NextResponse.json(result, { status: 201 });
}
