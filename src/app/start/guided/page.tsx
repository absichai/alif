"use client";

import { GuidedStepper } from "@/features/onboarding/guided-stepper";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";

export default function GuidedOnboardingPage() {
  return (
    <OnboardingShell eyebrow="Guided start">
      <GuidedStepper />
    </OnboardingShell>
  );
}
