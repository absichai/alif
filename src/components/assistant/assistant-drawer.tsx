"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProposalCard } from "./proposal-card";

type AssistantResult =
  | {
      kind: "answer";
      message: string;
      citedDefinitionIds: string[];
    }
  | {
      kind: "proposal";
      message: string;
      citedDefinitionIds: string[];
      proposal: { id: string };
    };

export function AssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok || !response.body) {
        throw new Error("Assistant unavailable");
      }
      const text = await new Response(response.body).text();
      const dataLine = text
        .split("\n")
        .find((line) => line.startsWith("data: "));
      if (!dataLine) throw new Error("Assistant response was incomplete");
      setResult(JSON.parse(dataLine.slice(6)) as AssistantResult);
    } catch {
      setError("ALIF could not answer just now. Your journey has not changed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--oasis)] px-5 font-extrabold text-white shadow-xl transition hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle aria-hidden size={18} /> Ask ALIF
      </button>
      {open ? (
        <div
          aria-label="Ask ALIF about your journey"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/25"
          role="dialog"
        >
          <button
            aria-label="Close assistant overlay"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <section className="relative h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
                  Your settling guide
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">Ask ALIF</h2>
              </div>
              <button
                aria-label="Close assistant"
                className="grid size-11 place-items-center rounded-full hover:bg-black/5"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Ask why a chapter matters or tell ALIF when your plans change.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#e8f3ee] p-3 text-xs leading-5 text-[var(--oasis)]">
              <ShieldCheck aria-hidden className="mt-0.5 shrink-0" size={16} />
              Answers use your curated journey. Changes always require your
              confirmation.
            </div>
            <form className="mt-8" onSubmit={submit}>
              <label className="font-bold" htmlFor="assistant-question">
                Your question
              </label>
              <textarea
                className="mt-2 min-h-32 w-full rounded-xl border border-[var(--border)] p-3"
                id="assistant-question"
                maxLength={1_500}
                minLength={2}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Why does residency come first?"
                required
                value={question}
              />
              <Button className="mt-3 w-full" disabled={pending} type="submit">
                {pending ? "Thinking…" : "Ask about my journey"}
              </Button>
            </form>
            {error ? (
              <p className="mt-5 text-[var(--error)]" role="alert">
                {error}
              </p>
            ) : null}
            {result ? (
              <div
                aria-live="polite"
                className="mt-6 rounded-2xl bg-[var(--sand)] p-5"
              >
                <p className="leading-7">{result.message}</p>
                {result.citedDefinitionIds.length > 0 ? (
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Grounded in {result.citedDefinitionIds.length} journey{" "}
                    {result.citedDefinitionIds.length === 1 ? "step" : "steps"}.
                  </p>
                ) : null}
                {result.kind === "proposal" ? (
                  <ProposalCard
                    proposalId={result.proposal.id}
                    summary="Update the residency path and recalculate affected chapters."
                  />
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
