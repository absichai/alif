"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { useOnboardingFlow } from "@/features/onboarding/onboarding-flow";
import {
  profileDraftSchema,
  type RelocationProfileDraft,
} from "@/features/profile/profile-schema";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[#fcfbf8] px-4 py-3";

const blankProfile: RelocationProfileDraft = {
  destinationCode: "AE-DXB",
  stage: null,
  moveTimeframe: null,
  household: null,
  residencyPath: null,
  passportCountry: null,
  incomeRange: null,
  preferences: {},
};

export default function GuidedOnboardingPage() {
  const router = useRouter();
  const { state, setGuidedProfile } = useOnboardingFlow("guided");
  const [skipIncome, setSkipIncome] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const relationshipStatus = values.get("relationshipStatus");
    const childrenCount = Number(values.get("childrenCount"));
    const parsed = profileDraftSchema.safeParse({
      ...blankProfile,
      stage: values.get("stage"),
      moveTimeframe: values.get("moveTimeframe"),
      household: {
        relationshipStatus,
        childrenCount,
        movingTogether:
          relationshipStatus === "single" ? "not_applicable" : values.get("movingTogether"),
      },
      residencyPath: values.get("residencyPath"),
      passportCountry: values.get("passportCountry"),
      incomeRange: skipIncome ? null : values.get("incomeRange") || null,
    });

    if (parsed.success) {
      setGuidedProfile(parsed.data);
      router.push("/journey-ready");
    }
  }

  return (
    <OnboardingShell eyebrow="Guided start">
      <div className="mt-14 max-w-2xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--journey-text)]">
          Five essentials
        </p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
          Let&apos;s map the shape of your move.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          These details determine which chapters belong in your journey. Income is
          optional and used only for future budget and housing guidance.
        </p>
      </div>

      <Card className="mt-10">
        <form className="grid gap-7" onSubmit={submit}>
          <label className="font-bold">
            1. Where are you in your Dubai journey?
            <select className={fieldClass} defaultValue="" name="stage" required>
              <option disabled value="">Choose your stage</option>
              <option value="exploring">Exploring the idea</option>
              <option value="preparing">Preparing to move</option>
              <option value="arrived">Already arrived</option>
            </select>
          </label>

          <label className="font-bold">
            2. When are you hoping to move?
            <input
              className={fieldClass}
              maxLength={120}
              name="moveTimeframe"
              placeholder="For example, September or within six months"
              required
            />
          </label>

          <fieldset className="grid gap-4">
            <legend className="font-bold">3. Who will be making the move?</legend>
            <label>
              Relationship status
              <select className={fieldClass} name="relationshipStatus" required>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </label>
            <label>
              Number of children moving
              <input
                className={fieldClass}
                defaultValue="0"
                max="12"
                min="0"
                name="childrenCount"
                required
                type="number"
              />
            </label>
            <label>
              If moving as a family, will everyone move together?
              <select className={fieldClass} name="movingTogether">
                <option value="together">Together</option>
                <option value="staggered">At different times</option>
              </select>
            </label>
          </fieldset>

          <label className="font-bold">
            4. How do you expect to obtain UAE residency?
            <select className={fieldClass} defaultValue="" name="residencyPath" required>
              <option disabled value="">Choose a route</option>
              <option value="employment">Employment sponsorship</option>
              <option value="business_or_self">Business or self-sponsorship</option>
              <option value="family_sponsored">Family sponsorship</option>
              <option value="unknown">I am not sure yet</option>
            </select>
          </label>

          <label className="font-bold">
            5. Which country issued your passport?
            <input
              className={fieldClass}
              maxLength={80}
              minLength={2}
              name="passportCountry"
              placeholder="Country name"
              required
            />
          </label>

          <div className="rounded-xl border border-dashed border-[var(--border)] p-5">
            <label className="font-bold">
              Optional: monthly household income in AED
              <select
                className={fieldClass}
                disabled={skipIncome}
                name="incomeRange"
                defaultValue=""
              >
                <option value="">Choose a range</option>
                <option value="under_10000">Under 10,000</option>
                <option value="10000_19999">10,000–19,999</option>
                <option value="20000_34999">20,000–34,999</option>
                <option value="35000_49999">35,000–49,999</option>
                <option value="50000_plus">50,000+</option>
              </select>
            </label>
            <Button
              className="mt-3"
              onClick={() => setSkipIncome(true)}
              type="button"
              variant="ghost"
            >
              {skipIncome ? "Skipped" : "Skip this"}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Create my journey draft</Button>
          </div>
          {state.error ? <p role="alert">{state.error}</p> : null}
        </form>
      </Card>
    </OnboardingShell>
  );
}
