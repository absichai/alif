import type { JourneyRepository } from "@/db/repositories/journey-repository";
import { buildJourney } from "@/features/journey/journey-engine";
import type { DestinationPack } from "@/features/journey/journey-types";

import {
  assistantModelOutputSchema,
  type AssistantModelOutput,
} from "./assistant-schema";

export interface AssistantModel {
  respond(input: {
    question: string;
    profile: unknown;
    journey: unknown;
    allowedDefinitions: unknown[];
  }): Promise<AssistantModelOutput>;
}

export async function answerJourneyQuestion(
  repository: Pick<
    JourneyRepository,
    "findActiveByClerkUserId" | "createProposal"
  >,
  model: AssistantModel,
  clerkUserId: string,
  question: string,
  pack: DestinationPack,
) {
  const stored = await repository.findActiveByClerkUserId(clerkUserId);
  if (!stored) throw new Error("Journey not found");
  const plan = buildJourney(
    stored.profile,
    pack,
    new Set(stored.completedDefinitionIds),
  );
  const allowedDefinitions = plan.stepIds.flatMap((id) => {
    const step = plan.stepsById[id];
    return step ? [step] : [];
  });

  const output = assistantModelOutputSchema.parse(
    await model.respond({
      question: question.slice(0, 1_500),
      profile: stored.profile,
      journey: {
        version: stored.version,
        milestones: plan.milestones,
      },
      allowedDefinitions,
    }),
  );

  const allowedIds = new Set(plan.stepIds);
  const citedDefinitionIds = output.citedDefinitionIds.filter((id) =>
    allowedIds.has(id),
  );
  if (output.kind === "answer") {
    return { ...output, citedDefinitionIds };
  }

  if (output.change.residencyPath === stored.profile.residencyPath) {
    return {
      kind: "answer" as const,
      message: "Your journey already uses that residency path.",
      citedDefinitionIds: ["residency_route"],
    };
  }

  const proposal = await repository.createProposal({
    clerkUserId,
    journeyVersion: stored.version,
    proposalType: "set_residency_path",
    payload: { residencyPath: output.change.residencyPath },
    expiresAt: new Date(Date.now() + 15 * 60 * 1_000),
  });

  return { ...output, citedDefinitionIds, proposal };
}
