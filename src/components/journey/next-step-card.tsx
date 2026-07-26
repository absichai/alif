import { ArrowRight, CalendarPlus, Compass } from "lucide-react";
import Link from "next/link";

import { unlockedBy } from "@/features/journey/journey-engine";
import type { JourneyPlan } from "@/features/journey/journey-types";

export function NextStepCard({ plan }: { plan: JourneyPlan }) {
  const currentStep = plan.stepIds
    .map((id) => plan.stepsById[id])
    .find((step) => step?.state === "current");

  if (!currentStep) {
    if (plan.progress.completed === plan.progress.total && plan.progress.total > 0) {
      return (
        <section className="mt-10 rounded-[var(--radius-card)] border-[3px] border-[var(--success)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--success)]">
            Journey complete
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            You have arrived — in every sense.
          </h2>
          <p className="mt-2 leading-7 text-[var(--muted)]">
            Every chapter in your journey is complete. If your plans change,
            update your profile and ALIF will map what is next.
          </p>
        </section>
      );
    }
    return null;
  }

  const unlocks = unlockedBy(plan, currentStep.id);

  return (
    <section className="mt-10 rounded-[var(--radius-card)] border-[3px] border-[var(--journey)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--journey-text)]">
            <Compass aria-hidden size={15} />
            Your next meaningful step
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{currentStep.title}</h2>
          <p className="mt-2 leading-7 text-[var(--muted)]">
            {currentStep.whyItMatters}
          </p>
          {unlocks.length > 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Completing it unlocks:{" "}
              <strong>{unlocks.map((step) => step.title).join(" · ")}</strong>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--journey)] px-5 font-semibold text-white"
            href={`/journey/milestones/${currentStep.milestoneKey}`}
          >
            Go to this step <ArrowRight aria-hidden size={16} />
          </Link>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--oasis)]"
            download="alif-dubai-journey.ics"
            href="/api/journey/calendar"
          >
            <CalendarPlus aria-hidden size={16} />
            Weekly reminders (.ics)
          </a>
        </div>
      </div>
    </section>
  );
}
