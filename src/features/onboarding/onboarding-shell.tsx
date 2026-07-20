import Link from "next/link";
import type { ReactNode } from "react";

import { AlifLogo } from "@/components/brand/alif-logo";

export function OnboardingShell({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow: string;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <Link href="/">
          <AlifLogo />
        </Link>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
          {eyebrow}
        </span>
      </header>
      {children}
    </main>
  );
}
