"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { AlifLogo } from "@/components/brand/alif-logo";
import { Card } from "@/components/ui/card";
import { readOnboardingDraft } from "@/features/onboarding/onboarding-store";
import { finalizeProfile } from "@/features/profile/profile-schema";

const benefits = ["Ordered milestones", "Official links", "Guidance that adapts"];

export default function JourneyReadyPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const draft = mounted ? readOnboardingDraft() : null;
  const ready = Boolean(draft?.profile && finalizeProfile(draft.profile).success);

  useEffect(() => {
    if (mounted && !ready) router.replace("/start");
  }, [mounted, ready, router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="text-[var(--muted)]">Preparing your next chapter…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <AlifLogo />
      <div className="my-auto grid items-center gap-10 py-16 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--journey-text)]">
            Your context is complete
          </p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">
            Your Dubai journey is ready to be created.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Create your free account to see your milestones, understand what comes
            next, and keep your journey as your plans change.
          </p>
          <Link
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--oasis)] px-6 py-3 font-bold text-white"
            href="/sign-up"
          >
            Create my free journey
          </Link>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Continue with Google or email. No payment details.
          </p>
        </div>
        <Card>
          <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[var(--muted)]">
            Inside your journey
          </p>
          <ul className="mt-6 grid gap-5">
            {benefits.map((benefit) => (
              <li className="flex items-center gap-3 font-bold" key={benefit}>
                <span className="grid size-9 place-items-center rounded-full bg-[#e8f3ee] text-[var(--success)]">
                  <Check aria-hidden="true" size={18} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
