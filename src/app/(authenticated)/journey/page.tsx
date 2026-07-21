import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { JourneyStream } from "@/components/journey/journey-stream";
import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import { getJourney } from "@/features/journey/journey-service";

export default async function JourneyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const result = await getJourney(
    new NeonJourneyRepository(),
    userId,
    dubaiPack,
  );
  if (!result) redirect("/start");

  const { plan } = result;
  const percent =
    plan.progress.total === 0
      ? 0
      : Math.round((plan.progress.completed / plan.progress.total) * 100);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
            Your Dubai story
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">
            From exploring to feeling at home
          </h1>
        </div>
        <div className="min-w-36">
          <p className="text-sm text-[var(--muted)]">
            <strong className="block text-2xl text-[var(--journey-text)]">
              {percent}%
            </strong>
            journey complete
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              aria-hidden="true"
              className="h-full rounded-full bg-[var(--journey)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      <JourneyStream plan={plan} />
    </main>
  );
}
