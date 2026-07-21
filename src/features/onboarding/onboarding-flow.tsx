"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMissingProfileFields,
  type MissingProfileField,
  type RelocationProfileDraft,
} from "@/features/profile/profile-schema";
import { profileQuestions } from "@/features/profile/profile-questions";

import {
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
} from "./onboarding-store";

type NextQuestion = {
  field: MissingProfileField;
  prompt: string;
  helper: string;
};

export type OnboardingFlowState = {
  status: "editing" | "extracting" | "question" | "ready" | "error";
  draft: OnboardingDraft;
  nextQuestion: NextQuestion | null;
  error: string | null;
};

const emptyDraft: OnboardingDraft = {
  mode: "story",
  story: "",
  profile: null,
};

function questionFor(profile: RelocationProfileDraft | null): NextQuestion | null {
  if (!profile) return null;
  const field = getMissingProfileFields(profile)[0];
  return field ? { field, ...profileQuestions[field] } : null;
}

export function useOnboardingFlow(
  mode: "story" | "guided",
): {
  state: OnboardingFlowState;
  setStory(story: string): void;
  setGuidedProfile(profile: RelocationProfileDraft): void;
  submitStory(): Promise<void>;
  answerMissingQuestion(answer: string): Promise<void>;
} {
  const router = useRouter();
  const initialDraft = { ...emptyDraft, mode };
  const draftRef = useRef<OnboardingDraft>(initialDraft);
  const [state, setState] = useState<OnboardingFlowState>({
    status: "editing",
    draft: initialDraft,
    nextQuestion: null,
    error: null,
  });

  useEffect(() => {
    const stored = readOnboardingDraft();
    if (!stored || stored.mode !== mode) return;
    draftRef.current = stored;
    const nextQuestion = questionFor(stored.profile);
    setState({
      status: nextQuestion ? "question" : "editing",
      draft: stored,
      nextQuestion,
      error: null,
    });
  }, [mode]);

  const save = useCallback((draft: OnboardingDraft) => {
    draftRef.current = draft;
    writeOnboardingDraft(draft);
    setState((current) => ({ ...current, draft, error: null }));
  }, []);

  const runExtraction = useCallback(
    async (answer?: string) => {
      setState((current) => ({ ...current, status: "extracting", error: null }));
      try {
        const current = readOnboardingDraft() ?? draftRef.current;
        const response = await fetch("/api/onboarding/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story: current.story,
            existingProfile: current.profile,
            answer,
          }),
        });
        const data: {
          profile?: RelocationProfileDraft;
          nextQuestion?: NextQuestion | null;
          error?: { message?: string };
        } = await response.json();
        if (!response.ok || !data.profile) {
          throw new Error(data.error?.message ?? "Extraction failed");
        }
        const nextDraft = { ...current, profile: data.profile };
        draftRef.current = nextDraft;
        writeOnboardingDraft(nextDraft);
        if (data.nextQuestion) {
          setState({
            status: "question",
            draft: nextDraft,
            nextQuestion: data.nextQuestion,
            error: null,
          });
          router.push("/start/questions");
          return;
        }
        setState({
          status: "ready",
          draft: nextDraft,
          nextQuestion: null,
          error: null,
        });
        router.push("/journey-ready");
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "ALIF could not understand that yet.",
        }));
      }
    },
    [router],
  );

  return {
    state,
    setStory(story) {
      save({ ...draftRef.current, mode, story });
    },
    setGuidedProfile(profile) {
      const draft = { ...draftRef.current, mode, profile };
      save(draft);
      if (getMissingProfileFields(profile).length === 0) {
        setState((current) => ({ ...current, status: "ready" }));
        router.push("/journey-ready");
      }
    },
    submitStory() {
      return runExtraction();
    },
    answerMissingQuestion(answer) {
      return runExtraction(answer);
    },
  };
}
