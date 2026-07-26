import type {
  JourneyPlan,
  JourneyStep,
} from "@/features/journey/journey-types";

export type BudgetLine = {
  stepId: string;
  title: string;
  phase: JourneyStep["phase"];
  completed: boolean;
  minAed: number;
  maxAed: number;
  note?: string;
};

export type PhaseBudget = {
  phase: JourneyStep["phase"];
  lines: BudgetLine[];
  minAed: number;
  maxAed: number;
};

export type BudgetSummary = {
  phases: PhaseBudget[];
  total: { minAed: number; maxAed: number };
  remaining: { minAed: number; maxAed: number };
};

const phaseOrder: JourneyStep["phase"][] = [
  "right_now",
  "before_move",
  "arrival",
  "first_month",
  "feeling_home",
];

export function buildBudgetSummary(plan: JourneyPlan): BudgetSummary {
  const lines: BudgetLine[] = plan.stepIds.flatMap((id) => {
    const step = plan.stepsById[id];
    if (!step || !step.setupCost) return [];
    return [
      {
        stepId: step.id,
        title: step.title,
        phase: step.phase,
        completed: step.state === "completed",
        minAed: step.setupCost.minAed,
        maxAed: step.setupCost.maxAed,
        note: step.setupCost.note,
      },
    ];
  });

  const phases = phaseOrder.flatMap<PhaseBudget>((phase) => {
    const phaseLines = lines.filter((line) => line.phase === phase);
    if (phaseLines.length === 0) return [];
    return [
      {
        phase,
        lines: phaseLines,
        minAed: phaseLines.reduce((sum, line) => sum + line.minAed, 0),
        maxAed: phaseLines.reduce((sum, line) => sum + line.maxAed, 0),
      },
    ];
  });

  const open = lines.filter((line) => !line.completed);
  return {
    phases,
    total: {
      minAed: lines.reduce((sum, line) => sum + line.minAed, 0),
      maxAed: lines.reduce((sum, line) => sum + line.maxAed, 0),
    },
    remaining: {
      minAed: open.reduce((sum, line) => sum + line.minAed, 0),
      maxAed: open.reduce((sum, line) => sum + line.maxAed, 0),
    },
  };
}

const aedFormatter = new Intl.NumberFormat("en-US");

export function formatAedRange(minAed: number, maxAed: number): string {
  if (minAed === maxAed) return `AED ${aedFormatter.format(minAed)}`;
  return `AED ${aedFormatter.format(minAed)}–${aedFormatter.format(maxAed)}`;
}
