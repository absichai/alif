"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export type ProposalEffect = {
  addedSteps: string[];
  removedSteps: string[];
  changedFields: string[];
};

export function ProposalCard({
  proposalId,
  effect,
}: {
  proposalId: string;
  effect: ProposalEffect | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"confirm" | "reject" | null>(null);
  const [decided, setDecided] = useState<"confirmed" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "confirm" | "reject") {
    setPending(decision);
    setError(null);
    try {
      const response = await fetch(
        `/api/assistant/proposals/${proposalId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        },
      );
      if (!response.ok) throw new Error("Decision failed");
      setDecided(decision === "confirm" ? "confirmed" : "rejected");
      router.refresh();
    } catch {
      setError("This suggestion is no longer available. Ask ALIF again.");
    } finally {
      setPending(null);
    }
  }

  if (decided) {
    return (
      <p
        className="mt-4 rounded-2xl border-2 border-[var(--border)] bg-white p-4 font-bold"
        role="status"
      >
        {decided === "confirmed"
          ? "Done — your journey now reflects this change."
          : "Kept your journey as it was."}
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-[var(--journey)] bg-[#f5f8ff] p-4">
      <p className="font-bold">Proposed journey update</p>
      {effect && effect.changedFields.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {effect.changedFields.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {effect && effect.addedSteps.length > 0 ? (
        <p className="mt-3 text-sm leading-6">
          <strong>Adds to your journey:</strong> {effect.addedSteps.join(" · ")}
        </p>
      ) : null}
      {effect && effect.removedSteps.length > 0 ? (
        <p className="mt-2 text-sm leading-6">
          <strong>No longer needed:</strong> {effect.removedSteps.join(" · ")}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-[var(--muted)]">
        Completed steps stay completed. ALIF will not change your journey until
        you confirm.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          disabled={pending !== null}
          onClick={() => void decide("confirm")}
        >
          {pending === "confirm" ? "Confirming…" : "Confirm change"}
        </Button>
        <Button
          disabled={pending !== null}
          onClick={() => void decide("reject")}
          variant="ghost"
        >
          {pending === "reject" ? "Keeping…" : "Keep my journey"}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
