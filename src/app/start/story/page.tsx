"use client";

import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { useOnboardingFlow } from "@/features/onboarding/onboarding-flow";

export default function StoryOnboardingPage() {
  const { state, setStory, submitStory } = useOnboardingFlow("story");
  const isBusy = state.status === "extracting";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitStory();
  }

  return (
    <OnboardingShell eyebrow="Your story">
      <div className="mt-14 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--journey-text)]">
          Start in your own words
        </p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
          Tell ALIF where life is taking you.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          There is no perfect way to explain a move. Share the situation, and ALIF
          will ask only for facts it still needs.
        </p>
      </div>

      <Card className="mt-10">
        <form onSubmit={submit}>
          <label className="block text-base font-bold" htmlFor="relocation-story">
            Tell us what is bringing you to Dubai, when you may move, and who is
            moving with you. Share only what you are comfortable sharing.
          </label>
          <textarea
            className="mt-4 min-h-48 w-full resize-y rounded-xl border border-[var(--border)] bg-[#f8fafd] p-4 text-base leading-7"
            id="relocation-story"
            maxLength={5000}
            minLength={20}
            onChange={(event) => setStory(event.target.value)}
            placeholder="For example: I am exploring a move from France later this year with my partner and our child. My employer may sponsor me..."
            required
            value={state.draft.story}
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              Your draft stays in this browser until you create an account.
            </p>
            <Button disabled={isBusy} type="submit">
              {isBusy ? "Understanding your story…" : "Continue my journey"}
            </Button>
          </div>
          {state.error ? (
            <div
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-[var(--error)]"
              role="alert"
            >
              <p>{state.error}</p>
              <Button className="mt-3" onClick={() => void submitStory()} type="button" variant="secondary">
                Try again
              </Button>
            </div>
          ) : null}
        </form>
      </Card>
    </OnboardingShell>
  );
}
