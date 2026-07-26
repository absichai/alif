import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { NeonDocumentRepository } from "@/db/repositories/neon-document-repository";
import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import { collectRequiredDocuments, documentStatusSchema } from "@/features/documents/document-readiness";
import { getJourney } from "@/features/journey/journey-service";
import { apiError } from "@/lib/http-errors";

const bodySchema = z.object({ status: documentStatusSchema });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }
  const body = bodySchema.safeParse(payload);
  if (!body.success) {
    return apiError(400, "INVALID_STATUS", "Choose a valid document status.");
  }

  const { key } = await context.params;
  const journey = await getJourney(new NeonJourneyRepository(), userId, getDestinationPack());
  if (!journey) {
    return apiError(404, "JOURNEY_NOT_FOUND", "Create a journey first.");
  }

  const documents = collectRequiredDocuments(journey.plan);
  if (!documents.some((document) => document.key === key)) {
    return apiError(
      404,
      "DOCUMENT_NOT_IN_JOURNEY",
      "That document is not part of your journey.",
    );
  }

  await new NeonDocumentRepository().setStatus({
    clerkUserId: userId,
    documentKey: key,
    status: body.data.status,
  });
  return NextResponse.json({ updated: true, status: body.data.status });
}
