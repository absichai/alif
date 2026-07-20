import type { JourneyPlan } from "@/features/journey/journey-types";

export function toJourneyStepRows(journeyId: string, plan: JourneyPlan) {
  return plan.stepIds.map((definitionId, position) => {
    const step = plan.stepsById[definitionId];
    if (!step) throw new Error(`Missing plan step ${definitionId}`);
    return {
      journeyId,
      definitionId,
      milestoneKey: step.milestoneKey,
      position,
      state: step.state,
      completedAt: step.state === "completed" ? new Date() : null,
      personalNote: null,
    };
  });
}
