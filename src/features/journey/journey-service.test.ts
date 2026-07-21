import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { createJourney } from "./journey-service";

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
