import Link from "next/link";

import { AlifLogo } from "@/components/brand/alif-logo";
import { Card } from "@/components/ui/card";

export default function StartPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <AlifLogo />
      <p className="mt-16 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--journey-text)]">
        Your journey begins here
      </p>
      <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
        How would you like to begin?
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Both paths take about two minutes.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link className="rounded-[var(--radius-card)]" href="/start/story">
          <Card className="h-full border-2 border-[var(--journey)] transition hover:-translate-y-1">
            <span className="text-3xl" aria-hidden="true">
              ✦
            </span>
            <h2 className="mt-8 text-2xl font-bold">Tell ALIF my story</h2>
            <p className="mt-2 text-[var(--muted)]">
              Describe your situation naturally. ALIF will ask only what is missing.
            </p>
          </Card>
        </Link>
        <Link className="rounded-[var(--radius-card)]" href="/start/guided">
          <Card className="h-full transition hover:-translate-y-1">
            <span className="text-3xl" aria-hidden="true">
              → 
            </span>
            <h2 className="mt-8 text-2xl font-bold">Guide me step by step</h2>
            <p className="mt-2 text-[var(--muted)]">
              Answer five focused questions at your own pace.
            </p>
          </Card>
        </Link>
      </div>
    </main>
  );
}
