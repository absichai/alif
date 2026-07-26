"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function StepCompletionButton({
  definitionId,
  completed,
  blocked,
}: {
  definitionId: string;
  completed: boolean;
  blocked: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/journey-steps/${definitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) {
        throw new Error("This step could not be updated.");
      }
      router.refresh();
    } catch {
      setError("This step could not be updated. Your journey has not changed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <Button
        disabled={blocked || pending}
        onClick={update}
        variant={completed ? "ghost" : "primary"}
      >
        {pending ? "Updating…" : completed ? "Reopen step" : "Mark complete"}
      </Button>
      {error ? (
        <p className="mt-2 max-w-56 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
