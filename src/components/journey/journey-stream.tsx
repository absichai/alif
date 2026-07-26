import { MilestoneCard } from "@/components/journey/milestone-card";
import type { JourneyPlan } from "@/features/journey/journey-types";

export function JourneyStream({ plan }: { plan: JourneyPlan }) {
  return (
    <ol
      aria-label="Your Dubai journey"
      className="relative mt-10 space-y-6"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-10 left-[23px] top-10 w-0.5 bg-[var(--border)] md:left-[31px]"
      />
      {plan.milestones.map((milestone, index) => (
        <li
          className="relative grid grid-cols-[48px_1fr] gap-4 md:grid-cols-[64px_1fr]"
          key={milestone.key}
        >
          <div className="z-10 flex flex-col items-center">
            <span
              className={`grid size-12 place-items-center rounded-full border-2 font-extrabold md:size-16 ${
                milestone.state === "current"
                  ? "border-[var(--journey)] bg-[var(--journey)] text-white"
                  : milestone.state === "completed"
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--muted)]"
              }`}
            >
              {index + 1}
              <span className="sr-only">
                {milestone.state === "current"
                  ? " — current chapter"
                  : milestone.state === "completed"
                    ? " — completed"
                    : milestone.state === "blocked"
                      ? " — waiting on earlier chapters"
                      : " — ready"}
              </span>
            </span>
          </div>
          <MilestoneCard milestone={milestone} />
        </li>
      ))}
    </ol>
  );
}
