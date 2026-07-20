import { describe, expect, it } from "vitest";

import {
  finalizeProfile,
  getMissingProfileFields,
  profileDraftSchema,
} from "./profile-schema";

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
});
