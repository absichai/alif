import {
  ArrowRight,
  Check,
  Compass,
  Landmark,
  Route,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { AlifLogo } from "@/components/brand/alif-logo";

const preview = [
  ["RIGHT NOW", "Define your route to Dubai"],
  ["BEFORE MOVE", "Make the move financially real"],
  ["ARRIVAL", "Become a Dubai resident"],
] as const;

const promises = [
  {
    icon: Route,
    title: "One connected journey",
    copy: "See how identity, home, money, mobility, and family decisions depend on one another.",
  },
  {
    icon: Landmark,
    title: "Official paths when it matters",
    copy: "Government steps lead to the responsible authority, with the source clearly visible.",
  },
  {
    icon: Compass,
    title: "Built around your life",
    copy: "Your stage, household, residency route, and plans decide which chapters appear.",
  },
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--sand)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <AlifLogo />
        <div className="flex items-center gap-5">
          <Link className="font-bold text-[var(--oasis)]" href="/sign-in">
            Sign in
          </Link>
          <Link
            className="hidden rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold sm:inline-flex"
            href="/start"
          >
            Start my journey
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div
          aria-hidden="true"
          className="absolute -right-80 -top-40 size-[34rem] rounded-full bg-[#f2662e14] blur-3xl"
        />
        <div className="relative">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--journey-text)]">
            Your personal settling journey
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.04] md:text-6xl">
            Your move is more than a checklist.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Tell ALIF where you are starting. Get a personal journey from
            considering Dubai to feeling at home.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--oasis)] px-6 py-3 font-extrabold text-white transition hover:-translate-y-0.5"
              href="/start"
            >
              Build my Dubai journey <ArrowRight aria-hidden size={18} />
            </Link>
            <a
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 font-bold text-[var(--oasis)]"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
            <Check aria-hidden className="text-[var(--success)]" size={17} />
            About two minutes. No account until your journey is ready.
          </p>
        </div>

        <div className="relative rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_30px_80px_rgba(19,60,51,0.14)]">
          <div className="mb-6 flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
            <Sparkles aria-hidden className="text-[var(--journey)]" size={18} />
            Prepared around your plans
          </div>
          <ol className="space-y-1">
            {preview.map(([phase, title], index) => (
              <li className="grid grid-cols-[44px_1fr] gap-4" key={phase}>
                <div className="flex flex-col items-center">
                  <span
                    className={`grid size-11 place-items-center rounded-full font-extrabold ${
                      index === 0
                        ? "bg-[var(--journey)] text-white"
                        : "border-2 border-[var(--border)] bg-white"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {index < preview.length - 1 ? (
                    <span className="h-14 w-0.5 bg-[var(--border)]" />
                  ) : null}
                </div>
                <div
                  className={`mb-5 rounded-2xl border bg-white p-4 ${
                    index === 0
                      ? "border-2 border-[var(--journey)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <span className="text-xs font-extrabold tracking-wide text-[var(--muted)]">
                    {phase}
                  </span>
                  <h2 className="mt-1 text-lg font-extrabold">{title}</h2>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl bg-[var(--oasis)] p-5 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffad88]">
              Next chapter
            </p>
            <p className="mt-1 font-extrabold">Turn your address into a home</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white" id="how-it-works">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--journey-text)]">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">
            Three steps to one clear journey
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              [
                "Describe your situation",
                "Tell your story in your own words, or answer five focused questions. Income stays optional.",
              ],
              [
                "Get your personal journey",
                "ALIF selects and orders the chapters that apply to your household, route, and timing.",
              ],
              [
                "Move forward with confidence",
                "Complete steps to unlock the next ones, track documents and budget, and ask ALIF when plans change.",
              ],
            ].map(([title, copy], index) => (
              <li key={title}>
                <span className="grid size-11 place-items-center rounded-full bg-[var(--journey)] font-extrabold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--sand)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {promises.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <span className="grid size-11 place-items-center rounded-xl bg-[#e8f3ee] text-[var(--oasis)]">
                <Icon aria-hidden size={21} />
              </span>
              <h2 className="mt-5 text-xl font-extrabold">{title}</h2>
              <p className="mt-2 leading-7 text-[var(--muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <AlifLogo compact />
          <p className="max-w-xl leading-6">
            ALIF is guidance, not legal, immigration, financial, medical, or
            real-estate advice. Government procedures always link to the
            responsible authority — confirm requirements there before acting.
          </p>
        </div>
      </footer>
    </main>
  );
}
