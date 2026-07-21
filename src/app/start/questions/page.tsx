"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { readOnboardingDraft } from "@/features/onboarding/onboarding-store";

export default function MissingQuestionPage() {
  const router = useRouter();
  const { state, answerMissingQuestion } = useOnboardingFlow("story");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!readOnboardingDraft()) router.replace("/start/story");
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) return;
    await answerMissingQuestion(answer.trim());
    setAnswer("");
  }

  return (
    <OnboardingShell eyebrow="One detail">
      <div className="mt-14 max-w-2xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--journey-text)]">
          Almost there
        </p>
        <h1 className="mt-3 text-4xl font-extrabold">
          {state.nextQuestion?.prompt ?? "Checking what your journey needs…"}
        </h1>
        {state.nextQuestion ? (
          <p className="mt-4 text-lg text-[var(--muted)]">
            {state.nextQuestion.helper}
          </p>
        ) : null}
      </div>

      <Card className="mt-10">
        <form onSubmit={submit}>
          <label className="font-bold" htmlFor="missing-answer">
            Your answer
          </label>
          <textarea
            className="mt-3 min-h-32 w-full rounded-xl border border-[var(--border)] bg-[#fcfbf8] p-4"
            id="missing-answer"
            maxLength={500}
            onChange={(event) => setAnswer(event.target.value)}
            required
            value={answer}
          />
          <div className="mt-5 flex justify-end">
            <Button disabled={state.status === "extracting"} type="submit">
              {state.status === "extracting" ? "Adding this detail…" : "Continue"}
            </Button>
          </div>
          {state.error ? (
            <div className="mt-5 rounded-xl bg-red-50 p-4" role="alert">
              <p className="text-sm text-[var(--error)]">{state.error}</p>
              <Button
                className="mt-3"
                onClick={() => void answerMissingQuestion(answer)}
                type="button"
                variant="secondary"
              >
                Try again
              </Button>
            </div>
          ) : null}
        </form>
      </Card>
    </OnboardingShell>
  );
}
