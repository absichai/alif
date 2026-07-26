import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { createJourney, updateProfile } from "./journey-service";

const storedProfile = {
  destinationCode: "AE-DXB" as const,
  stage: "exploring" as const,
  moveTimeframe: "Within six months",
  household: {
    relationshipStatus: "single" as const,
    childrenCount: 0,
    movingTogether: "not_applicable" as const,
  },
  residencyPath: "employment" as const,
  passportCountry: "France",
  incomeRange: null,
  preferences: {},
};

describe("createJourney", () => {
  it("builds from the curated pack and persists once", async () => {
    const createOrReplace = vi.fn(async ({ profile, plan }) => ({
      id: "journey-1",
      userId: "user-1",
      version: 1,
      profile,
      completedDefinitionIds: plan.stepIds.filter(() => false),
    }));

    const result = await createJourney(
      { createOrReplace } as never,
      "clerk-1",
      {
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
      },
      dubaiPack,
    );

    expect(createOrReplace).toHaveBeenCalledOnce();
    expect(result.plan.packVersion).toBe(dubaiPack.version);
    expect(result.plan.stepsById.residency_route?.title).toContain("residency");
  });
});

describe("updateProfile", () => {
  it("regenerates the journey and preserves completed steps", async () => {
    const replaceProfileAndPlan = vi.fn(async ({ profile, nextPlan }) => ({
      id: "journey-1",
      userId: "user-1",
      version: 2,
      profile,
      completedDefinitionIds: nextPlan.stepIds.filter(
        (id: string) => nextPlan.stepsById[id]?.state === "completed",
      ),
    }));

    const result = await updateProfile(
      {
        findActiveByClerkUserId: vi.fn(async () => ({
          id: "journey-1",
          userId: "user-1",
          version: 1,
          profile: storedProfile,
          completedDefinitionIds: ["residency_route"],
        })),
        replaceProfileAndPlan,
      } as never,
      "clerk-1",
      {
        household: {
          relationshipStatus: "married",
          childrenCount: 2,
          movingTogether: "together",
        },
      },
      dubaiPack,
    );

    expect(result.outcome).toBe("updated");
    if (result.outcome === "updated") {
      expect(result.plan.stepIds).toContain("family_sponsorship");
      expect(result.plan.stepIds).toContain("school_preparation");
      expect(result.plan.stepsById.residency_route?.state).toBe("completed");
      expect(result.stored.completedDefinitionIds).toContain("residency_route");
    }
  });

  it("reports an unchanged profile without persisting", async () => {
    const replaceProfileAndPlan = vi.fn();
    const result = await updateProfile(
      {
        findActiveByClerkUserId: vi.fn(async () => ({
          id: "journey-1",
          userId: "user-1",
          version: 1,
          profile: storedProfile,
          completedDefinitionIds: [],
        })),
        replaceProfileAndPlan,
      } as never,
      "clerk-1",
      { stage: "exploring" },
      dubaiPack,
    );

    expect(result.outcome).toBe("unchanged");
    expect(replaceProfileAndPlan).not.toHaveBeenCalled();
  });

  it("reports a missing journey", async () => {
    const result = await updateProfile(
      {
        findActiveByClerkUserId: vi.fn(async () => null),
        replaceProfileAndPlan: vi.fn(),
      } as never,
      "clerk-1",
      { stage: "arrived" },
      dubaiPack,
    );

    expect(result.outcome).toBe("not_found");
  });
});
