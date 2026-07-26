import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { answerJourneyQuestion, toProfilePatch } from "./assistant-service";
import type { AssistantProfilePatch } from "./assistant-schema";

const storedJourney = {
  id: "journey-1",
  userId: "user-1",
  version: 4,
  profile: {
    destinationCode: "AE-DXB" as const,
    stage: "exploring" as const,
    moveTimeframe: "Within six months",
    household: {
      relationshipStatus: "single" as const,
      childrenCount: 0,
      movingTogether: "not_applicable" as const,
    },
    residencyPath: "unknown" as const,
    passportCountry: "France",
    incomeRange: null,
    preferences: {},
  },
  completedDefinitionIds: [],
};

const emptyModelPatch: AssistantProfilePatch = {
  stage: null,
  moveTimeframe: null,
  household: null,
  residencyPath: null,
  passportCountry: null,
  incomeRange: null,
  wantsToDrive: null,
  propertyRequiresDistrictCooling: null,
};

describe("toProfilePatch", () => {
  it("drops null fields and merges preferences", () => {
    const patch = toProfilePatch(
      { ...emptyModelPatch, residencyPath: "employment", wantsToDrive: true },
      { propertyRequiresDistrictCooling: false },
    );

    expect(patch).toEqual({
      residencyPath: "employment",
      preferences: {
        propertyRequiresDistrictCooling: false,
        wantsToDrive: true,
      },
    });
  });

  it("returns null for an all-null patch", () => {
    expect(toProfilePatch(emptyModelPatch, {})).toBeNull();
  });
});

describe("answerJourneyQuestion", () => {
  it("returns an explanation without writing a proposal", async () => {
    const createProposal = vi.fn();
    const result = await answerJourneyQuestion(
      {
        findActiveByClerkUserId: vi.fn(async () => storedJourney),
        createProposal,
      } as never,
      {
        respond: vi.fn(async () => ({
          kind: "answer" as const,
          message:
            "Your residency route comes first because it changes later identity steps.",
          citedDefinitionIds: ["residency_route"],
        })),
      },
      "clerk-1",
      "Why does residency come first?",
      dubaiPack,
    );

    expect(result.kind).toBe("answer");
    expect(createProposal).not.toHaveBeenCalled();
  });

  it("persists but does not apply a valid proposal", async () => {
    const createProposal = vi.fn(async (input) => ({
      id: "proposal-1",
      journeyId: "journey-1",
      journeyVersion: input.journeyVersion,
      proposalType: input.proposalType,
      payload: input.payload,
      status: "pending" as const,
      expiresAt: input.expiresAt,
    }));

    const result = await answerJourneyQuestion(
      {
        findActiveByClerkUserId: vi.fn(async () => storedJourney),
        createProposal,
      } as never,
      {
        respond: vi.fn(async () => ({
          kind: "proposal" as const,
          message: "I can update your route to employment sponsorship.",
          citedDefinitionIds: ["residency_route"],
          change: {
            type: "update_profile" as const,
            patch: { ...emptyModelPatch, residencyPath: "employment" as const },
          },
        })),
      },
      "clerk-1",
      "I now have an employment visa.",
      dubaiPack,
    );

    expect(result.kind).toBe("proposal");
    expect(createProposal).toHaveBeenCalledOnce();
    expect(createProposal.mock.calls[0]?.[0]?.payload).toEqual({
      patch: { residencyPath: "employment" },
    });
    expect(storedJourney.profile.residencyPath).toBe("unknown");
  });

  it("describes the downstream effect of a household change", async () => {
    const createProposal = vi.fn(async (input) => ({
      id: "proposal-2",
      journeyId: "journey-1",
      journeyVersion: input.journeyVersion,
      proposalType: input.proposalType,
      payload: input.payload,
      status: "pending" as const,
      expiresAt: input.expiresAt,
    }));

    const result = await answerJourneyQuestion(
      {
        findActiveByClerkUserId: vi.fn(async () => storedJourney),
        createProposal,
      } as never,
      {
        respond: vi.fn(async () => ({
          kind: "proposal" as const,
          message: "Congratulations! I can add the family chapters.",
          citedDefinitionIds: [],
          change: {
            type: "update_profile" as const,
            patch: {
              ...emptyModelPatch,
              household: {
                relationshipStatus: "married" as const,
                childrenCount: 2,
                movingTogether: "together" as const,
              },
            },
          },
        })),
      },
      "clerk-1",
      "We got married and have two kids now.",
      dubaiPack,
    );

    expect(result.kind).toBe("proposal");
    if (result.kind === "proposal" && "effect" in result) {
      expect(result.effect.addedSteps.length).toBeGreaterThan(0);
      expect(result.effect.changedFields[0]).toContain("Married");
    }
  });

  it("answers instead of proposing when nothing would change", async () => {
    const createProposal = vi.fn();
    const result = await answerJourneyQuestion(
      {
        findActiveByClerkUserId: vi.fn(async () => storedJourney),
        createProposal,
      } as never,
      {
        respond: vi.fn(async () => ({
          kind: "proposal" as const,
          message: "I can set your stage to exploring.",
          citedDefinitionIds: [],
          change: {
            type: "update_profile" as const,
            patch: { ...emptyModelPatch, stage: "exploring" as const },
          },
        })),
      },
      "clerk-1",
      "I am exploring a move.",
      dubaiPack,
    );

    expect(result.kind).toBe("answer");
    expect(createProposal).not.toHaveBeenCalled();
  });
});
