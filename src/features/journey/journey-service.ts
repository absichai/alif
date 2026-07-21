import type { JourneyRepository } from "@/db/repositories/journey-repository";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { buildJourney } from "./journey-engine";
import type { DestinationPack } from "./journey-types";

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
