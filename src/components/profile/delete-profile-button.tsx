"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearOnboardingDraft } from "@/features/onboarding/onboarding-store";

export function DeleteProfileButton() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (confirmation !== "DELETE") return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      if (!response.ok) throw new Error("Deletion failed");
      clearOnboardingDraft();
      router.push("/start");
      router.refresh();
    } catch {
      setError("Your data could not be deleted just now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12 rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-6">
      <h2 className="text-xl font-semibold text-[var(--error)]">
        Delete ALIF journey data
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        This permanently deletes your relocation profile, journey, completed
        steps, and assistant proposals from ALIF. Your Clerk account is not
        deleted.
      </p>
      <label className="mt-5 block max-w-sm text-sm font-bold">
        Type DELETE to confirm
        <input
          className="mt-2 min-h-11 w-full rounded-xl border border-red-200 bg-white px-3"
          onChange={(event) => setConfirmation(event.target.value)}
          value={confirmation}
        />
      </label>
      <Button
        className="mt-4 bg-[var(--error)] hover:bg-[#8f1c14]"
        disabled={confirmation !== "DELETE" || pending}
        onClick={() => void remove()}
      >
        {pending ? "Deleting…" : "Delete my ALIF data"}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
