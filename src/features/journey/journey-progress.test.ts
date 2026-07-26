import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { updateJourneyStep } from "./journey-progress";

const baseProfile = {
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

describe("updateJourneyStep", () => {
  it("completes an unblocked step and persists the next plan", async () => {
    const setStepCompleted = vi.fn(async ({ nextPlan }) => ({
      id: "journey-1",
      userId: "user-1",
      version: 2,
      profile: baseProfile,
      completedDefinitionIds: nextPlan.stepIds.filter(
        (id: string) => nextPlan.stepsById[id]?.state === "completed",
      ),
    }));

    const result = await updateJourneyStep(
      {
        findActiveByClerkUserId: vi.fn(async () => ({
          id: "journey-1",
          userId: "user-1",
          version: 1,
          profile: baseProfile,
          completedDefinitionIds: [],
        })),
        setStepCompleted,
      } as never,
      "clerk-1",
      "residency_route",
      true,
      dubaiPack,
    );

    expect(setStepCompleted).toHaveBeenCalledOnce();
    expect(result.plan.stepsById.residency_route?.state).toBe("completed");
    expect(result.plan.stepsById.move_budget?.state).toBe("current");
  });

  it("rejects completing a blocked step", async () => {
    await expect(
      updateJourneyStep(
        {
          findActiveByClerkUserId: vi.fn(async () => ({
            id: "journey-1",
            userId: "user-1",
            version: 1,
            profile: baseProfile,
            completedDefinitionIds: [],
          })),
          setStepCompleted: vi.fn(),
        } as never,
        "clerk-1",
        "emirates_id",
        true,
        dubaiPack,
      ),
    ).rejects.toThrow("Blocked steps cannot be completed");
  });

  it("rejects a definition outside the owner's journey", async () => {
    await expect(
      updateJourneyStep(
        {
          findActiveByClerkUserId: vi.fn(async () => ({
            id: "journey-1",
            userId: "user-1",
            version: 1,
            profile: {
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
            completedDefinitionIds: [],
          })),
          setStepCompleted: vi.fn(),
        } as never,
        "clerk-1",
        "school_preparation",
        true,
        dubaiPack,
      ),
    ).rejects.toThrow("Step is not part of this journey");
  });
});
