import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import { updateProfile } from "@/features/journey/journey-service";
import { profilePatchSchema } from "@/features/profile/profile-schema";
import { apiError } from "@/lib/http-errors";

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }

  const patch = profilePatchSchema.safeParse(payload);
  if (!patch.success) {
    return apiError(400, "INVALID_PROFILE_PATCH", "Those changes are not valid.");
  }

  try {
    const result = await updateProfile(
      new NeonJourneyRepository(),
      userId,
      patch.data,
      getDestinationPack(),
    );
    if (result.outcome === "not_found") {
      return apiError(404, "JOURNEY_NOT_FOUND", "Create a journey first.");
    }
    if (result.outcome === "invalid") {
      return apiError(400, "INVALID_PROFILE_PATCH", result.message);
    }
    if (result.outcome === "unchanged") {
      return NextResponse.json({ updated: false });
    }
    return NextResponse.json({
      updated: true,
      journeyVersion: result.stored.version,
      progress: result.plan.progress,
    });
  } catch {
    return apiError(
      409,
      "PROFILE_UPDATE_CONFLICT",
      "Your journey changed while saving. Please try again.",
      true,
    );
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  await new NeonJourneyRepository().deleteUserData(userId);
  return NextResponse.json({ deleted: true });
}
