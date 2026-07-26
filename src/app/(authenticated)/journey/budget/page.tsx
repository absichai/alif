import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { getDestinationPack } from "@/data/destinations/registry";
import {
  buildBudgetSummary,
  formatAedRange,
} from "@/features/budget/budget-planner";
import { getJourney } from "@/features/journey/journey-service";
import { incomeLabels } from "@/features/profile/profile-labels";

const phaseLabels = {
  right_now: "Right now",
  before_move: "Before the move",
  arrival: "Arrival",
  first_month: "First month",
  feeling_home: "Feeling at home",
} as const;

export default async function BudgetPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const journey = await getJourney(new NeonJourneyRepository(), userId, getDestinationPack());
  if (!journey) redirect("/start");

  const summary = buildBudgetSummary(journey.plan);
  const income = journey.stored.profile.incomeRange;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link className="font-bold text-[var(--oasis)]" href="/journey">
        ← Back to journey
      </Link>
      <div className="mt-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
          Setup budget
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          What settling in may cost
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Planning ranges for the one-off setup costs in your personalized
          journey. These are estimates to help you plan, not official fees —
          always confirm current amounts with the official source linked on
          each step. Recurring costs such as rent and tuition are not included.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            Whole journey
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {formatAedRange(summary.total.minAed, summary.total.maxAed)}
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            Still ahead of you
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--journey-text)]">
            {formatAedRange(summary.remaining.minAed, summary.remaining.maxAed)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Completed steps are excluded from this range.
          </p>
        </div>
      </div>

      {income ? (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
          You shared a monthly household income of{" "}
          <strong>{incomeLabels[income]}</strong>. Setup costs arrive mostly in
          the arrival and first-month phases, so it can help to set that amount
          aside before the move.
        </p>
      ) : null}

      <div className="mt-10 space-y-6">
        {summary.phases.map((phase) => (
          <section
            className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-6"
            key={phase.phase}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-extrabold">
                {phaseLabels[phase.phase]}
              </h2>
              <p className="font-extrabold text-[var(--journey-text)]">
                {formatAedRange(phase.minAed, phase.maxAed)}
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {phase.lines.map((line) => (
                <li
                  className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--border)] pt-3"
                  key={line.stepId}
                >
                  <div className="max-w-xl">
                    <p className={line.completed ? "font-bold line-through opacity-60" : "font-bold"}>
                      {line.title}
                    </p>
                    {line.note ? (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {line.note}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-bold">
                    {formatAedRange(line.minAed, line.maxAed)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
