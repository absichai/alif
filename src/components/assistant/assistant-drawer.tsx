"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MessageCircle, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProposalCard, type ProposalEffect } from "./proposal-card";

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
      effect?: ProposalEffect;
    };

type ConversationEntry =
  | { role: "user"; text: string }
  | { role: "alif"; result: AssistantResult }
  | { role: "notice"; text: string };

const suggestedQuestions = [
  "What is my next meaningful step?",
  "Why does the residency route come first?",
  "What does Emirates ID unlock later?",
  "My plans changed — can I tell you about it?",
];

export function AssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const openerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [conversation, pending]);

  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function ask(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || pending) return;
    setPending(true);
    setQuestion("");
    setConversation((entries) => [...entries, { role: "user", text: trimmed }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok || !response.body) {
        throw new Error("Assistant unavailable");
      }
      const raw = await new Response(response.body).text();
      const dataLine = raw
        .split("\n")
        .find((line) => line.startsWith("data: "));
      if (!dataLine) throw new Error("Assistant response was incomplete");
      const result = JSON.parse(dataLine.slice(6)) as AssistantResult;
      setConversation((entries) => [...entries, { role: "alif", result }]);
    } catch {
      setConversation((entries) => [
        ...entries,
        {
          role: "notice",
          text: "ALIF could not answer just now. Your journey has not changed.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--oasis)] px-5 font-extrabold text-white shadow-xl transition hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
        ref={openerRef}
        type="button"
      >
        <MessageCircle aria-hidden size={18} /> Ask ALIF
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 sm:items-stretch sm:justify-end">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            onClick={close}
          />
          <section
            aria-label="Ask ALIF about your journey"
            aria-modal="true"
            className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none"
            onKeyDown={onPanelKeyDown}
            ref={panelRef}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
                  Your settling guide
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">Ask ALIF</h2>
              </div>
              <button
                aria-label="Close assistant"
                className="grid size-11 place-items-center rounded-full hover:bg-black/5"
                onClick={close}
                type="button"
              >
                <X aria-hidden />
              </button>
            </div>

            <div
              aria-live="polite"
              className="flex-1 overflow-y-auto p-5"
              ref={logRef}
            >
              <div className="flex items-start gap-2 rounded-xl bg-[#e8f3ee] p-3 text-xs leading-5 text-[var(--oasis)]">
                <ShieldCheck aria-hidden className="mt-0.5 shrink-0" size={16} />
                Answers use your curated journey. Changes always require your
                confirmation.
              </div>

              {conversation.length === 0 ? (
                <div className="mt-6">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    Try asking
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestedQuestions.map((suggestion) => (
                      <button
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold hover:border-[var(--oasis)] hover:text-[var(--oasis)]"
                        key={suggestion}
                        onClick={() => void ask(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-4">
                {conversation.map((entry, index) => {
                  if (entry.role === "user") {
                    return (
                      <p
                        className="ml-8 rounded-2xl rounded-br-sm bg-[var(--oasis)] p-4 text-sm font-bold leading-6 text-white"
                        key={index}
                      >
                        {entry.text}
                      </p>
                    );
                  }
                  if (entry.role === "notice") {
                    return (
                      <p className="text-sm text-[var(--error)]" key={index} role="alert">
                        {entry.text}
                      </p>
                    );
                  }
                  const { result } = entry;
                  return (
                    <div
                      className="mr-4 rounded-2xl rounded-bl-sm bg-[var(--sand)] p-5"
                      key={index}
                    >
                      <p className="leading-7">{result.message}</p>
                      {result.citedDefinitionIds.length > 0 ? (
                        <p className="mt-3 text-xs text-[var(--muted)]">
                          Grounded in {result.citedDefinitionIds.length} journey{" "}
                          {result.citedDefinitionIds.length === 1
                            ? "step"
                            : "steps"}
                          .
                        </p>
                      ) : null}
                      {result.kind === "proposal" ? (
                        <ProposalCard
                          effect={result.effect ?? null}
                          proposalId={result.proposal.id}
                        />
                      ) : null}
                    </div>
                  );
                })}
                {pending ? (
                  <p className="text-sm font-bold text-[var(--muted)]">
                    ALIF is thinking…
                  </p>
                ) : null}
              </div>
            </div>

            <form
              className="border-t border-[var(--border)] p-5"
              onSubmit={submit}
            >
              <label className="font-bold" htmlFor="assistant-question">
                Your question
              </label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] p-3"
                id="assistant-question"
                maxLength={1_500}
                minLength={2}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(question);
                  }
                }}
                placeholder="Why does residency come first?"
                ref={textareaRef}
                required
                value={question}
              />
              <Button className="mt-3 w-full" disabled={pending} type="submit">
                {pending ? "Thinking…" : "Ask about my journey"}
              </Button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
