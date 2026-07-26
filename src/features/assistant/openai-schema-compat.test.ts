import { zodTextFormat } from "openai/helpers/zod";
import { describe, expect, it } from "vitest";

import {
  assistantModelEnvelopeSchema,
  envelopeToOutput,
} from "./openai-assistant-model";
import {
  modelOutputToDraft,
  profileModelSchema,
} from "@/features/profile/openai-profile-model";

// OpenAI strict structured outputs reject root-level unions and .optional()
// fields. These tests fail at build time if a schema change reintroduces an
// incompatible shape, which previously broke every assistant and extraction
// request at runtime.
describe("OpenAI structured-output compatibility", () => {
  it("accepts the assistant envelope schema", () => {
    expect(() =>
      zodTextFormat(assistantModelEnvelopeSchema, "assistant_response"),
    ).not.toThrow();
  });

  it("accepts the profile extraction schema", () => {
    expect(() =>
      zodTextFormat(profileModelSchema, "relocation_profile"),
    ).not.toThrow();
  });

  it("converts envelopes to the internal union", () => {
    const answer = envelopeToOutput({
      kind: "answer",
      message: "Residency comes first.",
      citedDefinitionIds: ["residency_route"],
      change: null,
    });
    expect(answer.kind).toBe("answer");

    const inconsistent = envelopeToOutput({
      kind: "proposal",
      message: "No actual change stated.",
      citedDefinitionIds: [],
      change: null,
    });
    expect(inconsistent.kind).toBe("answer");
  });

  it("drops null preferences when converting model output to a draft", () => {
    const draft = modelOutputToDraft({
      stage: "exploring",
      moveTimeframe: "Within six months",
      household: null,
      residencyPath: "unknown",
      passportCountry: null,
      incomeRange: null,
      preferences: {
        wantsToDrive: true,
        needsSchools: null,
        propertyRequiresDistrictCooling: null,
        hasPets: null,
      },
    });

    expect(draft.preferences).toEqual({ wantsToDrive: true });
    expect(draft.stage).toBe("exploring");
    expect(draft.household).toBeNull();
  });
});
