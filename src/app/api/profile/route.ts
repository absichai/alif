import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { apiError } from "@/lib/http-errors";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  await new NeonJourneyRepository().deleteUserData(userId);
  return NextResponse.json({ deleted: true });
}
