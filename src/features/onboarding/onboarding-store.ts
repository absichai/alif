import { z } from "zod";

import { profileDraftSchema } from "@/features/profile/profile-schema";

const storageKey = "alif.onboarding.v1";

const onboardingDraftSchema = z.object({
  mode: z.enum(["story", "guided"]),
  story: z.string().max(5_000),
  profile: profileDraftSchema.nullable(),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export function readOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = onboardingDraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(draft: OnboardingDraft): void {
  const parsed = onboardingDraftSchema.parse(draft);
  window.sessionStorage.setItem(storageKey, JSON.stringify(parsed));
}

export function clearOnboardingDraft(): void {
  window.sessionStorage.removeItem(storageKey);
}
