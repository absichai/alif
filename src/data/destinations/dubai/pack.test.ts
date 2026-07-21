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
        expect(definition.officialSource.lastVerifiedAt).toBe("2026-07-20");
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
      },
    };
    expect(() => buildJourney(profile, dubaiPack, new Set())).not.toThrow();
  });
});
