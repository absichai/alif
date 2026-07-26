"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useOnboardingFlow } from "@/features/onboarding/onboarding-flow";
import {
  profileDraftSchema,
  type RelocationProfileDraft,
} from "@/features/profile/profile-schema";

type Answers = {
  stage?: "exploring" | "preparing" | "arrived";
  moveTimeframe?: string;
  relationshipStatus?: "single" | "married";
  childrenCount?: number;
  movingTogether?: "together" | "staggered";
  residencyPath?: "employment" | "business_or_self" | "family_sponsored" | "unknown";
  passportCountry?: string;
  wantsToDrive?: boolean;
  hasPets?: boolean;
  incomeRange?: RelocationProfileDraft["incomeRange"];
  incomeAnswered?: boolean;
};

type Option = { value: string; label: string; helper?: string };

type Step = {
  key: string;
  question: string;
  helper?: string;
  optional?: boolean;
  kind: "options" | "text";
  options?: Option[];
  columns?: 2 | 3;
  placeholder?: string;
};

const stageOptions: Option[] = [
  {
    value: "exploring",
    label: "Exploring the idea",
    helper: "Dubai is on my mind, nothing is decided yet",
  },
  {
    value: "preparing",
    label: "Preparing to move",
    helper: "The decision is made, now I'm organizing it",
  },
  {
    value: "arrived",
    label: "Already in Dubai",
    helper: "I've landed and I'm settling in",
  },
];

const timeframeOptions: Option[] = [
  { value: "Within 3 months", label: "Within 3 months" },
  { value: "In 3–6 months", label: "In 3–6 months" },
  { value: "In 6–12 months", label: "In 6–12 months" },
  { value: "No date yet", label: "No date yet" },
];

const residencyOptions: Option[] = [
  {
    value: "employment",
    label: "Through my job",
    helper: "An employer sponsors my residency",
  },
  {
    value: "business_or_self",
    label: "My own business",
    helper: "Company setup, freelance, or self-sponsorship",
  },
  {
    value: "family_sponsored",
    label: "Through family",
    helper: "A family member sponsors me",
  },
  {
    value: "unknown",
    label: "I'm not sure yet",
    helper: "ALIF will keep the options open",
  },
];

const incomeOptions: Option[] = [
  { value: "under_10000", label: "Under 10,000" },
  { value: "10000_19999", label: "10,000–19,999" },
  { value: "20000_34999", label: "20,000–34,999" },
  { value: "35000_49999", label: "35,000–49,999" },
  { value: "50000_plus", label: "50,000+" },
  { value: "skip", label: "Prefer not to say" },
];

const triStateOptions: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Not decided yet" },
];

export function GuidedStepper() {
  const router = useRouter();
  const { setGuidedProfile } = useOnboardingFlow("guided");
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [textValue, setTextValue] = useState("");
  const [showCustomTimeframe, setShowCustomTimeframe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [
      {
        key: "stage",
        question: "Where are you in your Dubai journey?",
        kind: "options",
        options: stageOptions,
      },
      {
        key: "timeframe",
        question: "When are you hoping to move?",
        helper: "A rough timeframe is enough — you can refine it later.",
        kind: "options",
        options: timeframeOptions,
        columns: 2,
      },
      {
        key: "relationship",
        question: "Who is making this move?",
        kind: "options",
        options: [
          { value: "single", label: "Just me" },
          { value: "married", label: "Me and my spouse" },
        ],
        columns: 2,
      },
      {
        key: "children",
        question: "How many children are moving with you?",
        kind: "options",
        options: [
          { value: "0", label: "None" },
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5 or more" },
        ],
        columns: 3,
      },
    ];
    if (answers.relationshipStatus === "married") {
      list.push({
        key: "movingTogether",
        question: "Will everyone move at the same time?",
        kind: "options",
        options: [
          { value: "together", label: "We move together" },
          { value: "staggered", label: "At different times" },
        ],
        columns: 2,
      });
    }
    list.push(
      {
        key: "residency",
        question: "How do you expect to get UAE residency?",
        kind: "options",
        options: residencyOptions,
      },
      {
        key: "passport",
        question: "Which country issued your passport?",
        helper: "Some document and entry requirements depend on it.",
        kind: "text",
        placeholder: "For example, France",
      },
      {
        key: "drive",
        question: "Are you planning to drive in Dubai?",
        kind: "options",
        options: triStateOptions,
        columns: 3,
      },
      {
        key: "pets",
        question: "Are pets moving with you?",
        kind: "options",
        options: triStateOptions,
        columns: 3,
      },
      {
        key: "income",
        question: "Monthly household income in AED?",
        helper:
          "Optional — used only for budget guidance, never required.",
        optional: true,
        kind: "options",
        options: incomeOptions,
        columns: 2,
      },
    );
    return list;
  }, [answers.relationshipStatus]);

  const step = steps[Math.min(stepIndex, steps.length - 1)]!;
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  function goToStep(index: number) {
    setError(null);
    setShowCustomTimeframe(false);
    setTextValue("");
    setStepIndex(index);
  }

  function finish(finalAnswers: Answers) {
    const preferences: Record<string, boolean> = {};
    if (finalAnswers.wantsToDrive !== undefined) {
      preferences.wantsToDrive = finalAnswers.wantsToDrive;
    }
    if (finalAnswers.hasPets !== undefined) {
      preferences.hasPets = finalAnswers.hasPets;
    }
    const parsed = profileDraftSchema.safeParse({
      destinationCode: "AE-DXB",
      stage: finalAnswers.stage ?? null,
      moveTimeframe: finalAnswers.moveTimeframe ?? null,
      household:
        finalAnswers.relationshipStatus === undefined
          ? null
          : {
              relationshipStatus: finalAnswers.relationshipStatus,
              childrenCount: finalAnswers.childrenCount ?? 0,
              movingTogether:
                finalAnswers.relationshipStatus === "married"
                  ? (finalAnswers.movingTogether ?? "together")
                  : "not_applicable",
            },
      residencyPath: finalAnswers.residencyPath ?? null,
      passportCountry: finalAnswers.passportCountry ?? null,
      incomeRange: finalAnswers.incomeRange ?? null,
      preferences,
    });
    if (!parsed.success) {
      setError("Something is missing — please go back and check your answers.");
      return;
    }
    setGuidedProfile(parsed.data);
    router.push("/journey-ready");
  }

  function advance(next: Answers) {
    setAnswers(next);
    if (isLast) {
      finish(next);
    } else {
      goToStep(stepIndex + 1);
    }
  }

  function choose(value: string) {
    const next: Answers = { ...answers };
    switch (step.key) {
      case "stage":
        next.stage = value as Answers["stage"];
        break;
      case "timeframe":
        next.moveTimeframe = value;
        break;
      case "relationship":
        next.relationshipStatus = value as Answers["relationshipStatus"];
        if (value === "single") delete next.movingTogether;
        break;
      case "children":
        next.childrenCount = Number(value);
        break;
      case "movingTogether":
        next.movingTogether = value as Answers["movingTogether"];
        break;
      case "residency":
        next.residencyPath = value as Answers["residencyPath"];
        break;
      case "drive":
        if (value === "unknown") delete next.wantsToDrive;
        else next.wantsToDrive = value === "yes";
        break;
      case "pets":
        if (value === "unknown") delete next.hasPets;
        else next.hasPets = value === "yes";
        break;
      case "income":
        next.incomeRange =
          value === "skip" ? null : (value as Answers["incomeRange"]);
        next.incomeAnswered = true;
        break;
    }
    advance(next);
  }

  function submitText(event: FormEvent) {
    event.preventDefault();
    const value = textValue.trim();
    if (step.key === "passport") {
      if (value.length < 2) {
        setError("Please enter the country that issued your passport.");
        return;
      }
      advance({ ...answers, passportCountry: value.slice(0, 80) });
    } else if (step.key === "timeframe") {
      if (value.length < 1) {
        setError("Tell us roughly when, in your own words.");
        return;
      }
      advance({ ...answers, moveTimeframe: value.slice(0, 120) });
    }
  }

  const progress = Math.round((stepIndex / steps.length) * 100);

  return (
    <div className="mx-auto mt-10 max-w-xl md:mt-16">
      <div className="flex items-center justify-between text-sm font-semibold text-[var(--muted)]">
        <span>
          Question {stepIndex + 1} of {steps.length}
        </span>
        {step.optional ? <span>Optional</span> : null}
      </div>
      <div
        aria-label="Onboarding progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e9f2]"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-[var(--journey)] transition-all duration-300"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      <h1
        className="mt-10 text-3xl font-semibold outline-none md:text-4xl"
        ref={headingRef}
        tabIndex={-1}
      >
        {step.question}
      </h1>
      {step.helper ? (
        <p className="mt-3 leading-7 text-[var(--muted)]">{step.helper}</p>
      ) : null}

      {step.kind === "options" && !showCustomTimeframe ? (
        <div
          className={`mt-8 grid gap-3 ${
            step.columns === 3
              ? "grid-cols-2 sm:grid-cols-3"
              : step.columns === 2
                ? "sm:grid-cols-2"
                : ""
          }`}
        >
          {step.options?.map((option) => (
            <button
              className="group rounded-2xl border border-[var(--border)] bg-white p-5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--journey)] hover:shadow-[0_10px_28px_rgba(31,68,187,0.10)]"
              key={option.value}
              onClick={() => choose(option.value)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold">{option.label}</span>
                <ArrowRight
                  aria-hidden
                  className="shrink-0 text-[var(--border)] transition group-hover:translate-x-0.5 group-hover:text-[var(--journey)]"
                  size={18}
                />
              </span>
              {option.helper ? (
                <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                  {option.helper}
                </span>
              ) : null}
            </button>
          ))}
          {step.key === "timeframe" ? (
            <button
              className="rounded-2xl border border-dashed border-[var(--border)] bg-transparent p-5 text-left font-semibold text-[var(--muted)] transition hover:border-[var(--journey)] hover:text-[var(--journey-text)]"
              onClick={() => setShowCustomTimeframe(true)}
              type="button"
            >
              Something else…
            </button>
          ) : null}
        </div>
      ) : null}

      {step.kind === "text" || showCustomTimeframe ? (
        <form className="mt-8" onSubmit={submitText}>
          <label className="sr-only" htmlFor="stepper-text">
            {step.question}
          </label>
          <input
            autoFocus
            className="min-h-14 w-full rounded-2xl border border-[var(--border)] bg-white px-5 text-lg shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            id="stepper-text"
            maxLength={step.key === "passport" ? 80 : 120}
            onChange={(event) => setTextValue(event.target.value)}
            placeholder={
              showCustomTimeframe ? "For example, next September" : step.placeholder
            }
            value={textValue}
          />
          <Button className="mt-4 w-full sm:w-auto" type="submit">
            Continue <ArrowRight aria-hidden className="ml-2" size={16} />
          </Button>
        </form>
      ) : null}

      {error ? (
        <p className="mt-5 font-semibold text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10">
        {stepIndex > 0 ? (
          <button
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]"
            onClick={() => goToStep(stepIndex - 1)}
            type="button"
          >
            <ArrowLeft aria-hidden size={16} /> Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
