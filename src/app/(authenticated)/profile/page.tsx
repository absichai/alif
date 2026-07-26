import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DeleteProfileButton } from "@/components/profile/delete-profile-button";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import { getJourney } from "@/features/journey/journey-service";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const journey = await getJourney(
    new NeonJourneyRepository(),
    userId,
    getDestinationPack(),
  );
  if (!journey) redirect("/start");

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
        Personalization
      </p>
      <h1 className="mt-2 text-4xl font-extrabold">Your relocation profile</h1>
      <p className="mt-3 text-[var(--muted)]">
        ALIF uses only these details to personalize your Dubai journey.
      </p>
      <ProfileEditor profile={journey.stored.profile} />
      <DeleteProfileButton />
    </main>
  );
}
