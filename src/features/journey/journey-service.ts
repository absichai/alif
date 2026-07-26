import type {
  JourneyRepository,
  StoredJourney,
} from "@/db/repositories/journey-repository";
import {
  applyProfilePatch,
  type RelocationProfile,
  type RelocationProfilePatch,
} from "@/features/profile/profile-schema";

import { buildJourney } from "./journey-engine";
import type { DestinationPack, JourneyPlan } from "./journey-types";

export async function createJourney(
  repository: Pick<JourneyRepository, "createOrReplace">,
  clerkUserId: string,
  profile: RelocationProfile,
  pack: DestinationPack,
) {
  const plan = buildJourney(profile, pack, new Set());
  const stored = await repository.createOrReplace({
    clerkUserId,
    profile,
    plan,
  });
  return { stored, plan };
}

export type ProfileUpdateResult =
  | { outcome: "updated"; stored: StoredJourney; plan: JourneyPlan }
  | { outcome: "unchanged" }
  | { outcome: "not_found" }
  | { outcome: "invalid"; message: string };

export async function updateProfile(
  repository: Pick<
    JourneyRepository,
    "findActiveByClerkUserId" | "replaceProfileAndPlan"
  >,
  clerkUserId: string,
  patch: RelocationProfilePatch,
  pack: DestinationPack,
): Promise<ProfileUpdateResult> {
  const stored = await repository.findActiveByClerkUserId(clerkUserId);
  if (!stored) return { outcome: "not_found" };

  const next = applyProfilePatch(stored.profile, patch);
  if (!next.success) {
    return { outcome: "invalid", message: "The updated profile is not valid." };
  }
  if (JSON.stringify(next.data) === JSON.stringify(stored.profile)) {
    return { outcome: "unchanged" };
  }

  const nextPlan = buildJourney(
    next.data,
    pack,
    new Set(stored.completedDefinitionIds),
  );
  const persisted = await repository.replaceProfileAndPlan({
    clerkUserId,
    expectedJourneyVersion: stored.version,
    profile: next.data,
    nextPlan,
  });
  return { outcome: "updated", stored: persisted, plan: nextPlan };
}

export async function getJourney(
  repository: Pick<JourneyRepository, "findActiveByClerkUserId">,
  clerkUserId: string,
  pack: DestinationPack,
) {
  const stored = await repository.findActiveByClerkUserId(clerkUserId);
  if (!stored) return null;
  return {
    stored,
    plan: buildJourney(
      stored.profile,
      pack,
      new Set(stored.completedDefinitionIds),
    ),
  };
}
