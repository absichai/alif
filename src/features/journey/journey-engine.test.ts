import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { buildJourney, unlockedBy } from "./journey-engine";

const baseProfile: RelocationProfile = {
  destinationCode: "AE-DXB",
  stage: "exploring",
  moveTimeframe: "Within six months",
  household: {
    relationshipStatus: "single",
    childrenCount: 0,
    movingTogether: "not_applicable",
  },
  residencyPath: "employment",
  passportCountry: "France",
  incomeRange: null,
  preferences: {},
};

describe("buildJourney", () => {
  it("selects a smaller journey for a single user without children", () => {
    const plan = buildJourney(baseProfile, dubaiPack, new Set());
    expect(plan.stepIds).not.toContain("school_preparation");
    expect(plan.stepIds).not.toContain("family_sponsorship");
    expect(plan.milestones[0]?.state).toBe("current");
  });

  it("adds family chapters when children are moving", () => {
    const plan = buildJourney(
      {
        ...baseProfile,
        household: {
          relationshipStatus: "married",
          childrenCount: 2,
          movingTogether: "together",
        },
      },
      dubaiPack,
      new Set(),
    );

    expect(plan.stepIds).toContain("family_sponsorship");
    expect(plan.stepIds).toContain("school_preparation");
  });

  it("unlocks the first dependent step after completion", () => {
    const first = buildJourney(baseProfile, dubaiPack, new Set());
    const next = buildJourney(
      baseProfile,
      dubaiPack,
      new Set(["residency_route"]),
    );

    expect(first.stepsById.residency_route?.state).toBe("current");
    expect(next.stepsById.residency_route?.state).toBe("completed");
    expect(next.stepsById.move_budget?.state).toBe("current");
  });

  it("lists the steps a completion unlocks", () => {
    const plan = buildJourney(baseProfile, dubaiPack, new Set());
    const unlocked = unlockedBy(plan, "emirates_id").map((step) => step.id);

    expect(unlocked).toContain("bank_account");
    expect(unlocked).toContain("ejari");
    expect(unlockedBy(plan, "school_preparation")).toHaveLength(0);
  });

  it("rejects packs with dependency cycles", () => {
    const cyclic = {
      destinationCode: "AE-DXB",
      version: "test",
      definitions: [
        {
          ...dubaiPack.definitions[0]!,
          id: "step_a",
          prerequisites: ["step_b"],
        },
        {
          ...dubaiPack.definitions[0]!,
          id: "step_b",
          prerequisites: ["step_a"],
        },
      ],
    };

    expect(() => buildJourney(baseProfile, cyclic, new Set())).toThrow(
      /dependency cycle/,
    );
  });
});
