import { auth } from "@clerk/nextjs/server";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import {
  buildJourneyCalendar,
  nextMonday,
} from "@/features/journey/journey-calendar";
import { getJourney } from "@/features/journey/journey-service";
import { apiError } from "@/lib/http-errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  const journey = await getJourney(new NeonJourneyRepository(), userId, dubaiPack);
  if (!journey) {
    return apiError(404, "JOURNEY_NOT_FOUND", "Create a journey first.");
  }

  const calendar = buildJourneyCalendar(journey.plan, {
    start: nextMonday(new Date()),
  });

  return new Response(calendar, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="alif-dubai-journey.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
