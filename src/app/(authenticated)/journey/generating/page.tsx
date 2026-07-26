"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { GenerationProgress } from "@/components/journey/generation-progress";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
} from "@/features/onboarding/onboarding-store";

export default function GeneratingJourneyPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const generate = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    const draft = readOnboardingDraft();
    try {
      const response = await fetch("/api/journeys", {
        method: draft?.profile ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: draft?.profile ? JSON.stringify(draft.profile) : undefined,
      });
      if (!response.ok) {
        const data: { error?: { message?: string } } = await response.json();
        throw new Error(data.error?.message ?? "Journey creation failed");
      }
      const result = await response.json();
      if (!result) {
        router.replace("/start");
        return;
      }
      clearOnboardingDraft();
      router.replace("/journey");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not create your journey yet. Please try again.",
      );
    } finally {
      inFlight.current = false;
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveIndex((value) => Math.min(value + 1, 2)),
      900,
    );
    const generation = window.setTimeout(() => void generate(), 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(generation);
    };
  }, [generate]);

  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--journey-text)]">
        Building your first route
      </p>
      <h1 className="mt-3 text-4xl font-extrabold">Mapping your route to Dubai</h1>
      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-7">
        <GenerationProgress activeIndex={activeIndex} />
      </div>
      {error ? (
        <div className="mt-8 rounded-xl bg-red-50 p-4" role="alert">
          <p className="text-[var(--error)]">{error}</p>
          <button
            className="mt-3 font-bold text-[var(--journey-text)]"
            onClick={() => void generate()}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : null}
    </main>
  );
}
