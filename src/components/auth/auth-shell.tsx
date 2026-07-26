import type { ReactNode } from "react";

import { AlifLogo } from "@/components/brand/alif-logo";

export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[var(--sand)] lg:grid-cols-2">
      <section className="hidden bg-[var(--oasis)] p-12 text-white lg:flex lg:flex-col">
        <div className="w-fit rounded-xl bg-white px-4 py-2">
          <AlifLogo />
        </div>
        <div className="mt-auto">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#ffad88]">
            Your personal settling journey
          </p>
          <p className="mt-4 max-w-md text-4xl font-extrabold leading-tight">
            From planning the move to feeling at home.
          </p>
          <div className="mt-10 h-1 w-28 rounded-full bg-[var(--journey)]" />
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--journey-text)]">
            {eyebrow}
          </p>
          <h1 className="mb-8 mt-2 text-3xl font-extrabold">{title}</h1>
          {children}
        </div>
      </section>
    </main>
  );
}
