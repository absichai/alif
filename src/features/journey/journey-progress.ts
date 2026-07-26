import type { JourneyRepository } from "@/db/repositories/journey-repository";

import { buildJourney } from "./journey-engine";
import type { DestinationPack } from "./journey-types";

export async function updateJourneyStep(
  repository: Pick<
    JourneyRepository,
    "findActiveByClerkUserId" | "setStepCompleted"
  >,
  clerkUserId: string,
  definitionId: string,
  completed: boolean,
  pack: DestinationPack,
) {
  const stored = await repository.findActiveByClerkUserId(clerkUserId);
  if (!stored) throw new Error("Journey not found");

  const before = buildJourney(
    stored.profile,
    pack,
    new Set(stored.completedDefinitionIds),
  );
  if (!before.stepIds.includes(definitionId)) {
    throw new Error("Step is not part of this journey");
  }
  const target = before.stepsById[definitionId];
  if (!target) throw new Error("Step is not part of this journey");
  if (completed && target.state === "blocked") {
    throw new Error("Blocked steps cannot be completed");
  }

  const completedIds = new Set(stored.completedDefinitionIds);
  if (completed) completedIds.add(definitionId);
  else completedIds.delete(definitionId);
  const nextPlan = buildJourney(stored.profile, pack, completedIds);

  const nextStored = await repository.setStepCompleted({
    clerkUserId,
    definitionId,
    completed,
    nextPlan,
  });
  return { stored: nextStored, plan: nextPlan };
}
