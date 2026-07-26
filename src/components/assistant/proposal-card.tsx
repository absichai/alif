"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ProposalCard({
  proposalId,
  summary,
}: {
  proposalId: string;
  summary: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"confirm" | "reject" | null>(null);
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
      router.refresh();
    } catch {
      setError("This suggestion is no longer available. Ask ALIF again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-[var(--journey)] bg-[#fff8f4] p-4">
      <p className="font-bold">{summary}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        ALIF will not change your journey until you confirm.
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
