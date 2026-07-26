import { describe, expect, it } from "vitest";

import {
  applyProfilePatch,
  finalizeProfile,
  getMissingProfileFields,
  profileDraftSchema,
  profilePatchSchema,
  type RelocationProfile,
} from "./profile-schema";

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

describe("relocation profile", () => {
  it("returns mandatory fields in conversational order", () => {
    const draft = profileDraftSchema.parse({
      destinationCode: "AE-DXB",
      stage: "exploring",
      moveTimeframe: null,
      household: null,
      residencyPath: "unknown",
      passportCountry: null,
      incomeRange: null,
      preferences: {},
    });

    expect(getMissingProfileFields(draft)).toEqual([
      "moveTimeframe",
      "household",
      "passportCountry",
    ]);
  });

  it("keeps income optional when finalizing", () => {
    const result = finalizeProfile({
      destinationCode: "AE-DXB",
      stage: "preparing",
      moveTimeframe: "Within three months",
      household: {
        relationshipStatus: "married",
        childrenCount: 1,
        movingTogether: "together",
      },
      residencyPath: "employment",
      passportCountry: "France",
      incomeRange: null,
      preferences: {},
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty profile patch", () => {
    expect(profilePatchSchema.safeParse({}).success).toBe(false);
    expect(profilePatchSchema.safeParse({ stage: "arrived" }).success).toBe(true);
  });

  it("applies a patch without touching other fields", () => {
    const patched = applyProfilePatch(baseProfile, {
      stage: "arrived",
      preferences: { wantsToDrive: true },
    });

    expect(patched.success).toBe(true);
    if (patched.success) {
      expect(patched.data.stage).toBe("arrived");
      expect(patched.data.preferences.wantsToDrive).toBe(true);
      expect(patched.data.passportCountry).toBe("France");
    }
  });

  it("rejects a patch that breaks validation", () => {
    const patched = applyProfilePatch(baseProfile, {
      passportCountry: "F",
    } as never);

    expect(patched.success).toBe(false);
  });
});
