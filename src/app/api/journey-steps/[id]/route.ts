import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import { updateJourneyStep } from "@/features/journey/journey-progress";
import { apiError } from "@/lib/http-errors";

const bodySchema = z.object({ completed: z.boolean() });

export async function PATCH(
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

  const body = bodySchema.safeParse(payload);
  if (!body.success) {
    return apiError(400, "INVALID_STATE", "Invalid completion state.");
  }
  const { id } = await context.params;

  try {
    const result = await updateJourneyStep(
      new NeonJourneyRepository(),
      userId,
      id,
      body.data.completed,
      dubaiPack,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Step update failed";
    return apiError(409, "STEP_UPDATE_REJECTED", message);
  }
}
