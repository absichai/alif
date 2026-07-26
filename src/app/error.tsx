"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-5">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--journey-text)]">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          ALIF hit a bump, not a wall.
        </h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Your journey and profile are safe. Try again in a moment.
        </p>
        <Button className="mt-6" onClick={() => reset()} type="button">
          Try again
        </Button>
      </div>
    </main>
  );
}
