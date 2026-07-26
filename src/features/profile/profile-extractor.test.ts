import { describe, expect, it } from "vitest";

import { extractRelocationProfile } from "./profile-extractor";

describe("extractRelocationProfile", () => {
  it("asks only the first missing mandatory question", async () => {
    const result = await extractRelocationProfile(
      {
        extract: async () => ({
          destinationCode: "AE-DXB",
          stage: "exploring",
          moveTimeframe: null,
          household: null,
          residencyPath: "unknown",
          passportCountry: "France",
          incomeRange: null,
          preferences: {},
        }),
      },
      { story: "I am French and thinking about Dubai." },
    );

    expect(result.missingFields).toEqual(["moveTimeframe", "household"]);
    expect(result.nextQuestion?.field).toBe("moveTimeframe");
    expect(result).not.toHaveProperty("journey");
  });
});
