import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { updateJourneyStep } from "./journey-progress";

describe("updateJourneyStep", () => {
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
