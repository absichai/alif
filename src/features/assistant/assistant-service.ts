import type { JourneyRepository } from "@/db/repositories/journey-repository";
import { buildJourney } from "@/features/journey/journey-engine";
import type {
  DestinationPack,
  JourneyPlan,
} from "@/features/journey/journey-types";
import {
  incomeLabels,
  residencyLabels,
  stageLabels,
} from "@/features/profile/profile-labels";
import {
  applyProfilePatch,
  type RelocationProfile,
  type RelocationProfilePatch,
} from "@/features/profile/profile-schema";

import {
  assistantModelOutputSchema,
  type AssistantModelOutput,
  type AssistantProfilePatch,
} from "./assistant-schema";

export interface AssistantModel {
  respond(input: {
    question: string;
    profile: unknown;
    journey: unknown;
    allowedDefinitions: unknown[];
  }): Promise<AssistantModelOutput>;
}

export type ProposalEffect = {
  addedSteps: string[];
  removedSteps: string[];
  changedFields: string[];
};

export function toProfilePatch(
  modelPatch: AssistantProfilePatch,
  currentPreferences: RelocationProfile["preferences"],
): RelocationProfilePatch | null {
  const patch: RelocationProfilePatch = {};
  if (modelPatch.stage !== null) patch.stage = modelPatch.stage;
  if (modelPatch.moveTimeframe !== null) {
    patch.moveTimeframe = modelPatch.moveTimeframe;
  }
  if (modelPatch.household !== null) patch.household = modelPatch.household;
  if (modelPatch.residencyPath !== null) {
    patch.residencyPath = modelPatch.residencyPath;
  }
  if (modelPatch.passportCountry !== null) {
    patch.passportCountry = modelPatch.passportCountry;
  }
  if (modelPatch.incomeRange !== null) patch.incomeRange = modelPatch.incomeRange;

  const preferences = { ...currentPreferences };
  let preferencesChanged = false;
  if (modelPatch.wantsToDrive !== null) {
    preferences.wantsToDrive = modelPatch.wantsToDrive;
    preferencesChanged = true;
  }
  if (modelPatch.propertyRequiresDistrictCooling !== null) {
    preferences.propertyRequiresDistrictCooling =
      modelPatch.propertyRequiresDistrictCooling;
    preferencesChanged = true;
  }
  if (preferencesChanged) patch.preferences = preferences;

  return Object.keys(patch).length > 0 ? patch : null;
}

export function describePatch(patch: RelocationProfilePatch): string[] {
  const lines: string[] = [];
  if (patch.stage) lines.push(`Journey stage → ${stageLabels[patch.stage]}`);
  if (patch.moveTimeframe) lines.push(`Move timeframe → ${patch.moveTimeframe}`);
  if (patch.household) {
    const household = patch.household;
    lines.push(
      `Household → ${household.relationshipStatus === "married" ? "Married" : "Single"}, ${household.childrenCount} ${household.childrenCount === 1 ? "child" : "children"}`,
    );
  }
  if (patch.residencyPath) {
    lines.push(`Residency path → ${residencyLabels[patch.residencyPath]}`);
  }
  if (patch.passportCountry) {
    lines.push(`Passport country → ${patch.passportCountry}`);
  }
  if (patch.incomeRange !== undefined) {
    lines.push(
      `Monthly income → ${patch.incomeRange ? incomeLabels[patch.incomeRange] : "Not provided"}`,
    );
  }
  if (patch.preferences) {
    if (patch.preferences.wantsToDrive !== undefined) {
      lines.push(
        `Planning to drive → ${patch.preferences.wantsToDrive ? "Yes" : "No"}`,
      );
    }
    if (patch.preferences.propertyRequiresDistrictCooling !== undefined) {
      lines.push(
        `District cooling at home → ${patch.preferences.propertyRequiresDistrictCooling ? "Yes" : "No"}`,
      );
    }
  }
  return lines;
}

function planEffect(current: JourneyPlan, next: JourneyPlan): Omit<ProposalEffect, "changedFields"> {
  const currentIds = new Set(current.stepIds);
  const nextIds = new Set(next.stepIds);
  return {
    addedSteps: next.stepIds
      .filter((id) => !currentIds.has(id))
      .map((id) => next.stepsById[id]?.title ?? id),
    removedSteps: current.stepIds
      .filter((id) => !nextIds.has(id))
      .map((id) => current.stepsById[id]?.title ?? id),
  };
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

  const patch = toProfilePatch(output.change.patch, stored.profile.preferences);
  if (!patch) {
    return {
      kind: "answer" as const,
      message: output.message,
      citedDefinitionIds,
    };
  }

  const nextProfile = applyProfilePatch(stored.profile, patch);
  if (!nextProfile.success) {
    return {
      kind: "answer" as const,
      message:
        "ALIF could not turn that into a valid journey update. You can adjust the details on your profile page instead.",
      citedDefinitionIds,
    };
  }
  if (JSON.stringify(nextProfile.data) === JSON.stringify(stored.profile)) {
    return {
      kind: "answer" as const,
      message: "Your journey already reflects those details.",
      citedDefinitionIds,
    };
  }

  const nextPlan = buildJourney(
    nextProfile.data,
    pack,
    new Set(stored.completedDefinitionIds),
  );
  const effect: ProposalEffect = {
    ...planEffect(plan, nextPlan),
    changedFields: describePatch(patch),
  };

  const proposal = await repository.createProposal({
    clerkUserId,
    journeyVersion: stored.version,
    proposalType: "update_profile",
    payload: { patch },
    expiresAt: new Date(Date.now() + 15 * 60 * 1_000),
  });

  return { ...output, citedDefinitionIds, proposal, effect };
}
