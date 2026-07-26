"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { DocumentStatus } from "@/features/documents/document-readiness";

const options: { value: DocumentStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "ready", label: "Ready" },
];

export function DocumentStatusControl({
  documentKey,
  documentLabel,
  status,
}: {
  documentKey: string;
  documentLabel: string;
  status: DocumentStatus;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<DocumentStatus>(status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(next: DocumentStatus) {
    if (next === current || pending) return;
    const previous = current;
    setCurrent(next);
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${documentKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      setCurrent(previous);
      setError("Could not save. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div
        aria-label={`Readiness of ${documentLabel}`}
        className="inline-flex flex-wrap gap-1 rounded-full border border-[var(--border)] bg-white p-1"
        role="group"
      >
        {options.map((option) => (
          <button
            aria-pressed={current === option.value}
            className={`min-h-9 rounded-full px-3 text-xs font-extrabold transition ${
              current === option.value
                ? option.value === "ready"
                  ? "bg-[#e8f3ee] text-[var(--success)]"
                  : "bg-[var(--journey)] text-white"
                : "text-[var(--muted)] hover:bg-black/5"
            }`}
            disabled={pending}
            key={option.value}
            onClick={() => void update(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
