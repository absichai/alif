import { describe, expect, it } from "vitest";

import { buildJourney } from "@/features/journey/journey-engine";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { dubaiPack } from "./pack";

describe("Dubai destination pack", () => {
  it("has unique stable IDs and valid source dates", () => {
    const ids = dubaiPack.definitions.map((definition) => definition.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const definition of dubaiPack.definitions) {
      if (definition.officialSource) {
        expect(definition.officialSource.url).toMatch(/^https:\/\//);
        expect(definition.officialSource.lastVerifiedAt).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
        expect(
          Number.isNaN(Date.parse(definition.officialSource.lastVerifiedAt)),
        ).toBe(false);
      }
    }
  });

  it("contains no unresolved dependency", () => {
    const profile: RelocationProfile = {
      destinationCode: "AE-DXB",
      stage: "preparing",
      moveTimeframe: "Within two months",
      household: {
        relationshipStatus: "married",
        childrenCount: 2,
        movingTogether: "together",
      },
      residencyPath: "employment",
      passportCountry: "Morocco",
      incomeRange: "20000_34999",
      preferences: {
        wantsToDrive: true,
        needsSchools: true,
        propertyRequiresDistrictCooling: true,
        hasPets: true,
      },
    };
    expect(() => buildJourney(profile, dubaiPack, new Set())).not.toThrow();
  });

  it("selects the expanded chapters for a full-family profile", () => {
    const profile: RelocationProfile = {
      destinationCode: "AE-DXB",
      stage: "preparing",
      moveTimeframe: "Within two months",
      household: {
        relationshipStatus: "married",
        childrenCount: 2,
        movingTogether: "together",
      },
      residencyPath: "employment",
      passportCountry: "Morocco",
      incomeRange: "20000_34999",
      preferences: {
        wantsToDrive: true,
        propertyRequiresDistrictCooling: true,
        hasPets: true,
      },
    };
    const plan = buildJourney(profile, dubaiPack, new Set());

    for (const id of [
      "shipping_household_goods",
      "pet_relocation",
      "arrival_accommodation",
      "nol_card",
      "salik_toll",
      "school_enrollment",
      "dependents_health_insurance",
      "community_belonging",
    ]) {
      expect(plan.stepIds).toContain(id);
    }
    expect(plan.milestones.at(-1)?.key).toBe("feeling_at_home");
  });

  it("keeps pet and toll steps out of journeys that do not need them", () => {
    const profile: RelocationProfile = {
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
    const plan = buildJourney(profile, dubaiPack, new Set());

    expect(plan.stepIds).not.toContain("pet_relocation");
    expect(plan.stepIds).not.toContain("salik_toll");
    expect(plan.stepIds).toContain("community_belonging");
  });
});
