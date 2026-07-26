import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { MilestoneDetail } from "@/components/journey/milestone-detail";
import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import { getJourney } from "@/features/journey/journey-service";

export default async function MilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  const result = await getJourney(
    new NeonJourneyRepository(),
    userId,
    getDestinationPack(),
  );
  if (!result) redirect("/start");
  const milestone = result.plan.milestones.find((item) => item.key === id);
  if (!milestone) notFound();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link className="font-bold text-[var(--oasis)]" href="/journey">
        ← Back to journey
      </Link>
      <div className="mt-8">
        <MilestoneDetail milestone={milestone} plan={result.plan} />
      </div>
    </main>
  );
}
