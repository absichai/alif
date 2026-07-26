import { Check, LockKeyhole } from "lucide-react";
import Link from "next/link";

import type { JourneyMilestone } from "@/features/journey/journey-types";

export function MilestoneCard({ milestone }: { milestone: JourneyMilestone }) {
  const current = milestone.state === "current";
  const completedCount = milestone.steps.filter(
    (step) => step.state === "completed",
  ).length;

  return (
    <article
      className={`rounded-[var(--radius-card)] bg-white p-6 shadow-[0_10px_30px_rgba(24,32,30,0.06)] ${
        current
          ? "border-[3px] border-[var(--journey)]"
          : "border border-[var(--border)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-extrabold uppercase tracking-[0.12em] ${
              current ? "text-[var(--journey-text)]" : "text-[var(--muted)]"
            }`}
          >
            {current ? "Your next chapter" : milestone.phase.replaceAll("_", " ")}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">{milestone.title}</h2>
        </div>
        <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
          {completedCount}/{milestone.steps.length} complete
        </span>
      </div>

      <ul className="mt-5 grid gap-3">
        {milestone.steps.slice(0, 3).map((step) => (
          <li className="flex items-center gap-3 text-sm" key={step.id}>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full ${
                step.state === "completed"
                  ? "bg-[var(--success)] text-white"
                  : step.state === "blocked"
                    ? "bg-[var(--sand)] text-[var(--muted)]"
                    : "bg-[#fff0e9] text-[var(--journey-text)]"
              }`}
            >
              {step.state === "completed" ? (
                <Check aria-hidden size={14} />
              ) : step.state === "blocked" ? (
                <LockKeyhole aria-hidden size={13} />
              ) : (
                "•"
              )}
            </span>
            <span className={step.state === "blocked" ? "text-[var(--muted)]" : ""}>
              {step.title}
              <span className="sr-only">
                {step.state === "completed"
                  ? " (completed)"
                  : step.state === "blocked"
                    ? " (waiting on earlier steps)"
                    : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <Link
        className="mt-5 inline-flex min-h-11 items-center font-extrabold text-[var(--journey-text)]"
        href={`/journey/milestones/${milestone.key}`}
      >
        {current ? "Begin chapter" : "View chapter"} →
      </Link>
    </article>
  );
}
