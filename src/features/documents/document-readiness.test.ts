import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import {
  collectRequiredDocuments,
  mergeDocumentStatuses,
} from "./document-readiness";

const familyProfile: RelocationProfile = {
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
  preferences: { wantsToDrive: true, hasPets: true },
};

describe("document readiness", () => {
  it("aggregates unique documents across the personalized journey", () => {
    const plan = buildJourney(familyProfile, dubaiPack, new Set());
    const documents = collectRequiredDocuments(plan);
    const keys = documents.map((document) => document.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("passport");
    expect(keys).toContain("attested_marriage_certificate");
    expect(keys).toContain("pet_vaccination_records");

    const passport = documents.find((document) => document.key === "passport");
    expect(passport && passport.neededFor.length).toBeGreaterThan(1);
  });

  it("excludes documents from steps outside the journey", () => {
    const plan = buildJourney(
      {
        ...familyProfile,
        household: {
          relationshipStatus: "single",
          childrenCount: 0,
          movingTogether: "not_applicable",
        },
        preferences: {},
      },
      dubaiPack,
      new Set(),
    );
    const keys = collectRequiredDocuments(plan).map((document) => document.key);

    expect(keys).not.toContain("attested_marriage_certificate");
    expect(keys).not.toContain("pet_vaccination_records");
    expect(keys).not.toContain("home_country_licence");
  });

  it("merges stored statuses with not_started defaults", () => {
    const plan = buildJourney(familyProfile, dubaiPack, new Set());
    const documents = collectRequiredDocuments(plan);
    const merged = mergeDocumentStatuses(
      documents,
      new Map([["passport", "ready"]]),
    );

    expect(merged.find((item) => item.key === "passport")?.status).toBe("ready");
    expect(
      merged.find((item) => item.key === "attested_degree")?.status,
    ).toBe("not_started");
  });
});
