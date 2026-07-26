import type { RelocationProfile } from "@/features/profile/profile-schema";

import type {
  DestinationPack,
  JourneyMilestone,
  JourneyPlan,
  JourneyStep,
  JourneyStepState,
  StepDefinition,
} from "./journey-types";

const milestoneTitles: Record<string, string> = {
  define_route: "Define your route to Dubai",
  financial_reality: "Make the move financially real",
  prepare_documents: "Prepare what your new life requires",
  land_confidently: "Land with confidence",
  become_resident: "Become a Dubai resident",
  first_home: "Open the door to your first home",
  functioning_home: "Turn your address into a functioning home",
  daily_foundations: "Create your daily foundations",
  money_mobility: "Set up money and mobility",
  family_arrival: "Help your family feel at home",
};

function applies(definition: StepDefinition, profile: RelocationProfile): boolean {
  const rule = definition.applicability;
  if (rule.stages && !rule.stages.includes(profile.stage)) return false;
  if (
    rule.minimumChildren !== undefined &&
    profile.household.childrenCount < rule.minimumChildren
  ) {
    return false;
  }
  if (rule.marriedOnly && profile.household.relationshipStatus !== "married") {
    return false;
  }
  if (rule.residencyPaths && !rule.residencyPaths.includes(profile.residencyPath)) {
    return false;
  }
  if (rule.preference) {
    return profile.preferences[rule.preference.key] === rule.preference.value;
  }
  return true;
}

function assertValidDependencies(definitions: StepDefinition[]): void {
  const byId = new Map<string, StepDefinition>();
  for (const definition of definitions) {
    if (byId.has(definition.id)) {
      throw new Error(`Duplicate journey definition: ${definition.id}`);
    }
    byId.set(definition.id, definition);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): void {
    if (visiting.has(id)) throw new Error(`Journey dependency cycle at ${id}`);
    if (visited.has(id)) return;
    const definition = byId.get(id);
    if (!definition) throw new Error(`Unknown journey dependency: ${id}`);
    visiting.add(id);
    definition.prerequisites.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }

  definitions.forEach((definition) => visit(definition.id));
}

export function buildJourney(
  profile: RelocationProfile,
  pack: DestinationPack,
  completedIds: Set<string>,
): JourneyPlan {
  assertValidDependencies(pack.definitions);
  const selected = pack.definitions.filter((definition) => applies(definition, profile));
  const selectedIds = new Set(selected.map((definition) => definition.id));
  let currentAssigned = false;

  const steps = selected.map<JourneyStep>((definition) => {
    const required = definition.prerequisites.filter((id) => selectedIds.has(id));
    const blockedBy = required.filter((id) => !completedIds.has(id));
    let state: JourneyStepState;
    if (completedIds.has(definition.id)) state = "completed";
    else if (blockedBy.length > 0) state = "blocked";
    else if (!currentAssigned) {
      state = "current";
      currentAssigned = true;
    } else state = "available";
    return { ...definition, state, blockedBy };
  });

  const milestones = steps.reduce<JourneyMilestone[]>((items, step) => {
    const existing = items.find((item) => item.key === step.milestoneKey);
    if (existing) {
      existing.steps.push(step);
      if (step.state === "current") existing.state = "current";
      else if (
        existing.state !== "current" &&
        existing.steps.every((item) => item.state === "completed")
      ) {
        existing.state = "completed";
      } else if (existing.state === "completed") {
        existing.state = step.state;
      }
      return items;
    }
    items.push({
      key: step.milestoneKey,
      title: milestoneTitles[step.milestoneKey] ?? step.title,
      phase: step.phase,
      category: step.category,
      state: step.state,
      steps: [step],
    });
    return items;
  }, []);

  return {
    destinationCode: pack.destinationCode,
    packVersion: pack.version,
    stepIds: steps.map((step) => step.id),
    stepsById: Object.fromEntries(steps.map((step) => [step.id, step])),
    milestones,
    progress: {
      completed: steps.filter((step) => step.state === "completed").length,
      total: steps.length,
    },
  };
}
