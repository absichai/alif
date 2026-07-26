import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";
import { apiError } from "@/lib/http-errors";

const decisionSchema = z.object({
  decision: z.enum(["confirm", "reject"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }
  const decision = decisionSchema.safeParse(payload);
  if (!decision.success) {
    return apiError(400, "INVALID_DECISION", "Choose confirm or reject.");
  }

  const { id } = await context.params;
  const repository = new NeonJourneyRepository();
  const proposal = await repository.findProposalForOwner({
    clerkUserId: userId,
    proposalId: id,
  });
  if (
    !proposal ||
    proposal.status !== "pending" ||
    proposal.expiresAt <= new Date()
  ) {
    return apiError(
      409,
      "STALE_PROPOSAL",
      "This suggestion is no longer current.",
    );
  }

  if (decision.data.decision === "reject") {
    await repository.markProposal({
      clerkUserId: userId,
      proposalId: id,
      status: "rejected",
    });
    return NextResponse.json({ updated: false, rejected: true });
  }

  const stored = await repository.findActiveByClerkUserId(userId);
  if (!stored || stored.version !== proposal.journeyVersion) {
    return apiError(
      409,
      "JOURNEY_CHANGED",
      "Your journey changed. Ask ALIF again.",
    );
  }
  const profile = {
    ...stored.profile,
    residencyPath: proposal.payload.residencyPath,
  };
  const nextPlan = buildJourney(
    profile,
    dubaiPack,
    new Set(stored.completedDefinitionIds),
  );

  try {
    const updated = await repository.applyResidencyPathProposal({
      clerkUserId: userId,
      proposalId: id,
      expectedJourneyVersion: proposal.journeyVersion,
      profile,
      nextPlan,
    });
    return NextResponse.json({
      updated: true,
      journeyVersion: updated.version,
    });
  } catch {
    return apiError(
      409,
      "STALE_PROPOSAL",
      "This suggestion is no longer current.",
    );
  }
}
