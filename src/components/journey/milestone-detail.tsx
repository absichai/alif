import {
  CalendarCheck,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { unlockedBy } from "@/features/journey/journey-engine";
import type {
  JourneyMilestone,
  JourneyPlan,
  JourneyStepState,
} from "@/features/journey/journey-types";
import { formatVerifiedDate } from "@/lib/format-date";

import { StepCompletionButton } from "./step-completion-button";

const stateLabels: Record<JourneyStepState, string> = {
  completed: "Completed",
  current: "Current focus",
  available: "Ready to start",
  blocked: "Waiting on earlier steps",
};

export function MilestoneDetail({
  milestone,
  plan,
}: {
  milestone: JourneyMilestone;
  plan: JourneyPlan;
}) {
  return (
    <section>
      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
        {milestone.phase.replaceAll("_", " ")}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold">{milestone.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Work through this chapter in order. ALIF will open dependent steps as
        their foundations are completed.
      </p>

      <div className="mt-10 space-y-5">
        {milestone.steps.map((step) => {
          const blockers = step.blockedBy.flatMap((id) => {
            const blocker = plan.stepsById[id];
            return blocker ? [blocker] : [];
          });
          const unlocks = unlockedBy(plan, step.id);

          return (
            <article
              className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6"
              key={step.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                        step.state === "completed"
                          ? "bg-[#e8f3ee] text-[var(--success)]"
                          : step.state === "blocked"
                            ? "bg-[var(--sand)] text-[var(--muted)]"
                            : "bg-[#fff0e9] text-[var(--journey-text)]"
                      }`}
                    >
                      {stateLabels[step.state]}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-extrabold">{step.title}</h2>
                  <p className="mt-2 leading-7 text-[var(--muted)]">{step.summary}</p>
                  <p className="mt-4 text-sm leading-6">
                    <strong>Why it matters:</strong> {step.whyItMatters}
                  </p>
                  {blockers.length > 0 ? (
                    <div className="mt-4 text-sm text-[var(--warning)]">
                      <p className="flex items-center gap-2 font-bold">
                        <LockKeyhole aria-hidden size={16} />
                        Unlocked after you complete:
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-9">
                        {blockers.map((blocker) => (
                          <li key={blocker.id}>
                            <Link
                              className="underline decoration-dotted underline-offset-4"
                              href={`/journey/milestones/${blocker.milestoneKey}`}
                            >
                              {blocker.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {unlocks.length > 0 ? (
                    <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                      <KeyRound aria-hidden size={16} />
                      <span>
                        <strong>Unlocks:</strong>{" "}
                        {unlocks.map((item) => item.title).join(" · ")}
                      </span>
                    </p>
                  ) : null}
                </div>
                <StepCompletionButton
                  blocked={step.state === "blocked"}
                  completed={step.state === "completed"}
                  definitionId={step.id}
                />
              </div>

              {step.officialSource || step.serviceType ? (
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border)] pt-5 text-sm">
                  {step.officialSource ? (
                    <>
                      <a
                        className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--oasis)]"
                        href={step.officialSource.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Official source · {step.officialSource.organization}
                        <ExternalLink aria-hidden size={16} />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                      <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                        <CalendarCheck aria-hidden size={15} />
                        Verified {formatVerifiedDate(step.officialSource.lastVerifiedAt)}
                      </span>
                    </>
                  ) : null}
                  {step.serviceType ? (
                    <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                      <Sparkles aria-hidden size={16} />
                      Suggested service type · {step.serviceType}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
