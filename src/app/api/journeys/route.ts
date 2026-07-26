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
  try {
    const result = await getJourney(repository, userId, dubaiPack);
    return NextResponse.json(result);
  } catch {
    return apiError(
      503,
      "JOURNEY_UNAVAILABLE",
      "ALIF could not load your journey just now. Please try again.",
      true,
    );
  }
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

  try {
    const result = await createJourney(repository, userId, profile.data, dubaiPack);
    return NextResponse.json(result, { status: 201 });
  } catch {
    // Two concurrent creates can race past the existence check; the partial
    // unique index keeps one active journey, so return whichever row won.
    const raced = await getJourney(repository, userId, dubaiPack).catch(
      () => null,
    );
    if (raced) return NextResponse.json(raced);
    return apiError(
      503,
      "JOURNEY_CREATE_FAILED",
      "ALIF could not create your journey just now. Please try again.",
      true,
    );
  }
}
