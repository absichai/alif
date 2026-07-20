import { describe, expect, it, vi } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";

import { answerJourneyQuestion } from "./assistant-service";

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
            type: "set_residency_path" as const,
            residencyPath: "employment" as const,
          },
        })),
      },
      "clerk-1",
      "I now have an employment visa.",
      dubaiPack,
    );

    expect(result.kind).toBe("proposal");
    expect(createProposal).toHaveBeenCalledOnce();
    expect(storedJourney.profile.residencyPath).toBe("unknown");
  });
});
