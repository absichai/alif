import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";

import { toJourneyStepRows } from "./journey-row-mapper";

describe("toJourneyStepRows", () => {
  it("preserves definition order, milestone, and state", () => {
    const plan = buildJourney(
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
      new Set(),
    );

    const rows = toJourneyStepRows("journey-1", plan);
    expect(rows[0]).toMatchObject({
      journeyId: "journey-1",
      definitionId: "residency_route",
      milestoneKey: "define_route",
      position: 0,
      state: "current",
    });
  });
});
